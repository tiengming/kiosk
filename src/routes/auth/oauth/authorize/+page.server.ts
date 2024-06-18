import type { PageServerLoad } from './$types';
import { getJwtCookie, verifyToken } from '$lib/server/auth/utilities';
import { findUserByIdentifier, type User } from '$lib/server/data/authentication/user';
import { redirect } from '@sveltejs/kit';
import { storePreviousLocation } from '$lib/server/utilities';
import { errorRedirect, oauthRedirect, userFacingOauthError } from '$lib/server/auth/oauth/response';
import { OAuthAuthorizationError, OAuthError } from '$lib/server/auth/oauth/OAuthError';
import { validateAuthorization } from '$lib/server/auth/oauth/authorization';
import { createAuthorizationCode } from '$lib/server/data/authentication/oauth';
import { OAUTH_AUTHORIZATION_CODE_TTL } from '$env/static/private';

/**
 * Authorization endpoint
 *
 * This endpoint is used to obtain authorization from the user to access their resources.
 * It initiates the {@link https://datatracker.ietf.org/doc/html/rfc6749#autoid-5|OAuth 2.0
 * Authorization Code Grant}.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6749 RFC 6749
 */
export const load = async function load({ request, url, cookies, locals: { database } }) {
  // region User Authorization
  let user: User | undefined;
  let sub;

  try {
    const token = getJwtCookie(cookies) || '';
    ({ sub } = verifyToken(token));
    user = await findUserByIdentifier(database, sub as string);
  } catch (error) {
    user = undefined;
  }

  // Redirect to the login page if the user is not authenticated
  if (!user) {
    storePreviousLocation(cookies, url);
    const target = new URL(url);
    target.pathname = '/auth/login';

    throw redirect(303, target);
  }
  // endregion

  // region Validate the authorization request
  const queryParams = Object.fromEntries(url.searchParams.entries());
  let codeChallenge: string;
  let clientId: string;
  let scopes: string[];
  let redirectUri: string | URL;
  let state: string | undefined;

  try {
    ({ clientId, codeChallenge, scopes, redirectUri, state } = await validateAuthorization(
      database,
      queryParams,
      true,
    ));
  } catch (error) {
    if (error instanceof OAuthAuthorizationError) {
      const { code: title, redirectUri, state, description, uri } = error;

      throw errorRedirect(redirectUri, state, { title, description, uri });
    }

    if (error instanceof OAuthError) {
      const { code, description, uri } = error;

      throw userFacingOauthError(request, code, description, uri);
    }

    throw error;
  }
  // endregion

  // region Issue the authorization code
  const { code } = await createAuthorizationCode(
    database,
    user.id,
    clientId,
    redirectUri,
    scopes,
    codeChallenge,
    Number(OAUTH_AUTHORIZATION_CODE_TTL),
  );

  throw oauthRedirect(redirectUri, { code, state });
  // endregion
} satisfies PageServerLoad;
