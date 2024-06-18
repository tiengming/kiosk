import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { findUserByIdentifier } from '$lib/server/data/authentication/user';
import { resolveAcceptedMediaTypes } from '$lib/server/utilities';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import type { Client as Database } from '$lib/server/database';
import { checkAuthorization, claimUrl } from '$lib/server/auth/oauth/utilities';
import { oauthError } from '$lib/server/auth/oauth/response';

export const GET: RequestHandler = async function handler({ request, url, locals: { database } }) {
  return handleUserInfo(request, url, database);
};

export const POST: RequestHandler = async function handler({ request, url, locals: { database } }) {
  return handleUserInfo(request, url, database);
};

export const prerender = false;

async function handleUserInfo(request: Request, url: URL, database: Database) {
  let authorizedUserId: string | null;
  let authorizedClientId: string;

  try {
    ({ user_id: authorizedUserId, client_id: authorizedClientId } = await checkAuthorization(
      database,
      request,
    ));
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    const { message, cause } = error;

    return oauthError('invalid_client', message + (cause ? `: ${cause}` : ''));
  }

  if (!authorizedUserId) {
    return oauthError('access_denied', 'The user is not authenticated');
  }

  const {
    birthdate,
    email,
    name,
    role,
    id: sub,
    updated_at,
    verified: email_verified,
  } = await findUserByIdentifier(database, authorizedUserId);

  for (const mediaType of resolveAcceptedMediaTypes(request)) {
    if (mediaType.startsWith('application/json') || mediaType === '*/*') {
      return json({
        sub,
        name,
        email,
        email_verified,
        preferred_username: email,
        birthdate: birthdate?.toDateString(),
        updated_at: Math.floor((updated_at ?? new Date()).getTime() / 1_000),
        [claimUrl(url, 'role').toString()]: role,
      });
    }

    if (mediaType === 'application/jwt') {
      const jsonWebToken = jwt.sign(
        {
          name,
          email,
          email_verified,
          preferred_username: email,
          birthdate: birthdate?.toDateString(),
          updated_at: Math.floor((updated_at ?? new Date()).getTime() / 1_000),
          [claimUrl(url, 'role').toString()]: role,
        },
        env.JWT_SECRET,
        {
          subject: sub,
          issuer: url.origin,
          audience: authorizedClientId,
        },
      );

      return new Response(jsonWebToken);
    }
  }

  throw error(406, 'Unsupported media type requested');
}
