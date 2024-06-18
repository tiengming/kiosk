import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { loadAccessToken } from '$lib/server/data/authentication/oauth';
import { z } from 'zod';
import { oauthError } from '$lib/server/auth/oauth/response';
import { checkAuthorization } from '$lib/server/auth/oauth/utilities';
import type { AccessToken } from '$lib/server/auth/oauth/types';

export const prerender = false;

export const POST: RequestHandler = async function handler({ request, locals: { database } }) {
  if (!dev) {
    return json(
      {
        error: 'access_denied',
        error_description: 'The Token introspection endpoint is disabled in production',
      },
      { status: 403 },
    );
  }

  if (request.headers.has('authorisation')) {
    throw error(418, {
      title: 'HTTP was designed in the colonies',
      message: `The request is too posh for this server: Try using 'Authorization' instead`,
    });
  }

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

  let authorizedClientId: string;

  try {
    ({ client_id: authorizedClientId } = await checkAuthorization(database, request));
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    const { message, cause } = error;

    return oauthError('invalid_client', message + (cause ? `: ${cause}` : ''));
  }

  let accessToken: AccessToken | undefined;

  try {
    accessToken = await loadAccessToken(database, token.data);
  } catch {
    accessToken = undefined;
  }

  if (
    !accessToken ||
    accessToken.revoked_at !== null ||
    accessToken.expires_at <= new Date() ||
    authorizedClientId !== accessToken.client_id
  ) {
    return json({ active: false });
  }

  return json({
    active: true,
    scope: accessToken.scopes.join(' '),
    client_id: accessToken.client_id,
    username: accessToken.user_id,
    exp: Math.floor(accessToken.expires_at.getTime() / 1_000),
  });
};
