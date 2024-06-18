import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { validateAuthorization } from '$lib/server/auth/oauth/authorization';
import { OAuthError } from '$lib/server/auth/oauth/OAuthError';
import { oauthError } from '$lib/server/auth/oauth/response';
import { storeAuthorizationRequest } from '$lib/server/data/authentication/oauth';
import { OAUTH_AUTHORIZATION_REQUEST_TTL } from '$env/static/private';
import { offsetInSeconds } from '$lib/server/auth/oauth/utilities';

/**
 * Pushed Authorization Request endpoint
 *
 * This endpoint is used to create a Pushed Authorization Request (PAR) URI. The PAR URI is a
 * reference to an authorization request that is stored on the authorization server. The client
 * can use the PAR URI to initiate the authorization request.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc9126 RFC 9126
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1 RFC 6749, Section 4.1.1
 */
export const POST = async function handle({ request, locals: { database } }) {
  // region Validate the authorization request
  let body: FormData;

  try {
    body = await request.formData();
  } catch {
    return oauthError(
      'invalid_request',
      'The request content type must be application/x-www-form-urlencoded',
    );
  }

  // Bail if the request_uri parameter is used in the request
  const params = z
    .union([
      z.object({
        request_uri: z.never({
          message: 'The request_uri parameter is not allowed in this request',
        }),
      }),
      z.record(z.string()),
    ])
    .safeParse(Object.fromEntries(body.entries()));

  if (!params.success) {
    const issue = params.error.issues.shift()!;

    return oauthError('invalid_request', issue.message);
  }

  let responseType: string;
  let codeChallenge: string;
  let codeChallengeMethod: string;
  let clientId: string;
  let scopes: string[];
  let redirectUri: string | URL;
  let state: string | null;

  try {
    ({
      responseType,
      clientId,
      codeChallenge,
      codeChallengeMethod,
      scopes,
      redirectUri,
      state = null,
    } = await validateAuthorization(database, params.data));
  } catch (error) {
    if (error instanceof OAuthError) {
      const { code, description, uri } = error;

      return oauthError(code, description, uri);
    }

    throw error;
  }
  // endregion

  // region Store the authorization request
  const { identifier, expires_at } = await storeAuthorizationRequest(database, {
    code_challenge_method: codeChallengeMethod,
    expires_at: new Date(Date.now() + Number(OAUTH_AUTHORIZATION_REQUEST_TTL) * 1_000),
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
    response_type: responseType,
    client_id: clientId,
    scopes,
    state,
  });

  const requestUri = `urn:ietf:params:oauth:request_uri:${identifier}`;
  // endregion

  return json(
    {
      request_uri: requestUri,
      expires_in: offsetInSeconds(expires_at),
    },
    {
      status: 201,
      headers: { 'Cache-Control': 'no-cache, no-store' },
    },
  );
} satisfies RequestHandler;
