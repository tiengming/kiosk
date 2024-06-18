import type { RequestHandler } from './$types';
import {
  revokeAccessToken,
  revokeAccessTokenOrRefreshToken,
  revokeRefreshToken,
} from '$lib/server/data/authentication/oauth';
import { z } from 'zod';
import { checkAuthorization } from '$lib/server/auth/oauth/utilities';
import { oauthError } from '$lib/server/auth/oauth/response';

export const prerender = false;

export const POST: RequestHandler = async function handler({ request, locals: { database } }) {
  let body: FormData;

  try {
    body = await request.formData();
  } catch {
    return oauthError(
      'invalid_request',
      'The request content type must be application/x-www-form-urlencoded',
    );
  }

  const token = z
    .string({ message: 'The Access Token is missing or invalid' })
    .safeParse(body.get('token'));

  if (!token.success) {
    return oauthError('invalid_client', token.error);
  }

  const tokenTypeHint = z
    .enum(['access_token', 'refresh_token'], {
      message: `The token type hint must be one of 'access_token' or 'refresh_token'`,
    })
    .optional()
    .safeParse(body.get('token_type_hint'));

  if (!tokenTypeHint.success) {
    return oauthError('invalid_request', tokenTypeHint.error);
  }

  try {
    const { client_id } = await checkAuthorization(database, request);

    switch (tokenTypeHint.data) {
      case 'refresh_token':
        await revokeRefreshToken(database, client_id, token.data);
        break;

      case 'access_token':
        await revokeAccessToken(database, client_id, token.data);
        break;

      default:
        await revokeAccessTokenOrRefreshToken(database, client_id, token.data);
        break;
    }
  } finally {
    // Failures during token revokation are supposed to return a 200 OK regardless:
    // https://datatracker.ietf.org/doc/html/rfc7009#section-2.2
  }

  return new Response(undefined, { status: 200 });
};
