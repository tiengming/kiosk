import type { Client as Database } from '$lib/server/database';
import {
  createAccessToken,
  createRefreshToken,
  loadAccessToken,
} from '$lib/server/data/authentication/oauth';
import type { MaybePromise } from '$lib/utilities';
import { OAUTH_ACCESS_TOKEN_TTL, OAUTH_REFRESH_TOKEN_TTL } from '$env/static/private';
import { z, type ZodType } from 'zod';
import type { AccessToken, GrantType, OAuthErrorCode } from '$lib/server/auth/oauth/types';

export async function checkAuthorization(database: Database, request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    throw new Error('The client authentication is invalid', {
      cause: 'Missing Authorization header',
    });
  }

  const [scheme, token] = authorization.split(' ', 2);

  if (scheme !== 'Bearer') {
    throw new Error('The client authentication is invalid', {
      cause: `Unexpected authorization scheme: Must be 'Bearer'`,
    });
  }

  let accessToken: AccessToken;

  try {
    accessToken = await loadAccessToken(database, token);
  } catch {
    throw new Error('The client authentication is invalid', {
      cause: 'The access token is invalid',
    });
  }

  if (accessToken.expires_at <= new Date()) {
    throw new Error('The client authentication is invalid', {
      cause: 'The access token has expired',
    });
  }

  if (accessToken.revoked_at !== null) {
    throw new Error('The client authentication is invalid', {
      cause: 'The access token has been revoked',
    });
  }

  return accessToken;
}

export async function issueTokens(
  database: Database,
  clientId: string,
  userId: string | null,
  scopes: string[],
  postIssuance?: <T extends Record<string, unknown>>(trx: Database) => MaybePromise<T | void>,
) {
  return await database.transaction().execute(async (trx) => {
    const [
      { scopes: effectiveScopes, token: accessToken, expires_at: expiresAt },
      { token: refreshToken },
    ] = await Promise.all([
      createAccessToken(trx, clientId, userId, scopes, Number(OAUTH_ACCESS_TOKEN_TTL)),
      createRefreshToken(trx, clientId, userId, scopes, Number(OAUTH_REFRESH_TOKEN_TTL)),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresAt,
      scopes: effectiveScopes,
      ...(postIssuance ? await postIssuance(trx) : undefined),
    };
  });
}

export function claimUrl(url: URL, claim: string) {
  return new URL(`/auth/oauth/claims/${claim}`, url.origin);
}

export function offsetInSeconds(date: Date, reference = new Date()) {
  return Math.floor((date.getTime() - reference.getTime()) / 1_000);
}

export const statusMap: Record<OAuthErrorCode, number> = {
  invalid_request: 400,
  invalid_scope: 400,
  unsupported_response_type: 400,
  unsupported_grant_type: 400,
  slow_down: 400,
  expired_token: 400,
  authorization_pending: 400,
  invalid_client: 401,
  invalid_grant: 403,
  unauthorized_client: 403,
  access_denied: 403,
  server_error: 500,
  temporarily_unavailable: 502,
};

/**
 * Create a grant type instance
 *
 * Helper function to create a grant type with automatic type inference.
 *
 * @param grantType
 */
export function createGrantType<T extends ZodType, U = z.TypeOf<T>>(
  grantType: GrantType<T, U>,
): GrantType<T, U> {
  return grantType;
}
