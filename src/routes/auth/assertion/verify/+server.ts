import { getAuthSessionIdFromCookie, setJwtCookie } from '$lib/server/auth/utilities';
import {
  type VerifiedAuthenticationResponse,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';
import { type Cookies, error, json, type RequestHandler } from '@sveltejs/kit';
import {
  type Authenticator,
  findAuthenticatorByIdentifier,
  updateAuthenticator,
} from '$lib/server/data/authentication/authenticator';
import {
  deleteChallenges,
  resolveCurrentChallenge,
} from '$lib/server/data/authentication/challenge';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { NoResultError } from 'kysely';
import { resolvePreviousLocation } from '$lib/server/utilities';
import type { Client } from '$lib/server/database';
import { decodeFromBase64 } from '$lib/utilities';

export const POST = async function handler({ url, request, cookies, locals: { database } }) {
  // region Resolve Authentication Session
  const sessionId = getAuthSessionIdFromCookie(cookies);

  if (!sessionId) {
    throw error(401, 'Not authenticated');
  }
  // endregion

  // region Resolve current Challenge
  let challenge: string;

  try {
    challenge = await resolveCurrentChallenge(database, sessionId);
  } catch (err) {
    if (!(err instanceof Error)) {
      throw err;
    }

    throw error(400, `Failed to resolve challenge: ${err.message}`);
  }
  // endregion

  // region Fetch and validate the response
  let response: AuthenticationResponseJSON;

  try {
    response = (await request.json()) as AuthenticationResponseJSON;
  } catch (err) {
    if (!(err instanceof Error)) {
      throw err;
    }

    await deleteChallenges(database, sessionId);

    return error(400, `Invalid request body: ${err.message}`);
  }

  const userId = response.response.userHandle;

  if (!userId) {
    await deleteChallenges(database, sessionId);

    return error(400, `Invalid payload: Missing user handle`);
  }
  // endregion

  // region Resolve Authenticator
  let authenticator: Authenticator;

  try {
    authenticator = await resolveAuthenticator(database, response, userId);
  } catch (reason) {
    const { message } = reason instanceof Error ? reason : { message: 'Invalid authenticator' };

    await deleteChallenges(database, sessionId);

    return error(400, { message });
  }
  // endregion

  // region Verify the authentication response
  let verificationResponse: VerifiedAuthenticationResponse;

  try {
    verificationResponse = await verify(url, response, challenge, authenticator);
  } catch (cause) {
    const { message } = cause instanceof Error ? cause : { message: 'Failed to verify response' };

    await deleteChallenges(database, sessionId);

    return error(400, { message });
  }

  const {
    verified,
    authenticationInfo: { newCounter: counter },
  } = verificationResponse;

  if (verified) {
    // Update the authenticator's counter in the DB to the newest count in the authentication
    await updateAuthenticator(database, response.rawId, {
      counter: counter.toString(),
      last_used_at: new Date(),
    });
  }

  await deleteChallenges(database, sessionId);
  // endregion

  // region Issue Access Token
  issueAccessToken(cookies, authenticator);
  // endregion

  // region Resolve previous URL and generate response
  const destination = resolvePreviousLocation(cookies, url, '/');

  return json({ verified, destination });
  // endregion
} satisfies RequestHandler;

async function resolveAuthenticator(
  database: Client,
  response: AuthenticationResponseJSON,
  userId: string,
) {
  let authenticator: Authenticator | null;

  try {
    authenticator = await findAuthenticatorByIdentifier(database, response.rawId);
  } catch (cause) {
    if (!(cause instanceof NoResultError)) {
      throw cause;
    }

    authenticator = null;
  }

  if (!authenticator || authenticator.user_id !== userId) {
    throw new Error('Authenticator is not registered with this site');
  }

  return authenticator;
}

async function verify(
  url: URL,
  response: AuthenticationResponseJSON,
  challenge: string,
  { counter, identifier, public_key, transports }: Authenticator,
) {
  try {
    return await verifyAuthenticationResponse({
      response,
      requireUserVerification: true,
      expectedChallenge: `${challenge}`,
      expectedOrigin: url.origin, // <-- TODO: Use origin from RP ID instead
      expectedRPID: url.hostname, // <-- TODO: Use hostname from env instead
      authenticator: {
        credentialPublicKey: decodeFromBase64(public_key),
        credentialID: decodeFromBase64(identifier),
        counter: Number(counter),
        transports,
      },
    });
  } catch (cause) {
    if (!(cause instanceof Error)) {
      throw cause;
    }

    throw new Error(`Failed to verify authentication response: ${cause.message}`, {
      cause,
    });
  }
}

function issueAccessToken(cookies: Cookies, { id: authenticator, user_id }: Authenticator) {
  console.error('Unexpected token issue', {authenticator, user_id})
  // Sign the user token: We have authenticated the user successfully using the passcode, so they
  // may use this JWT to create their pass *key*.
  const token = jwt.sign({ authenticator }, env.JWT_SECRET, {
    subject: user_id,
  });

  // Set the cookie on the response: It will be included in any requests to the server, including
  // for tRPC. This makes for a nice, transparent, and "just works" authentication scheme.
  setJwtCookie(cookies, token);
}

export type VerificationResponse = {
  verified: boolean;
  destination: string;
};
