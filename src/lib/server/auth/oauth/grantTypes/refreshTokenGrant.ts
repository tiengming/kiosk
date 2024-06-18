import { z } from 'zod';
import {
  loadRefreshToken,
  revokeRefreshToken,
  scopeValidationRegex,
} from '$lib/server/data/authentication/oauth';
import { OAuthError } from '$lib/server/auth/oauth/OAuthError';
import { createGrantType, issueTokens, offsetInSeconds } from '$lib/server/auth/oauth/utilities';
import type { RefreshToken, TokenPayload } from '$lib/server/auth/oauth/types';

export const refreshTokenGrant = createGrantType({
  type: 'refresh_token',

  schema: z.object({
    grant_type: z.literal('refresh_token', {
      message: 'The grant type is missing or invalid',
    }),
    client_id: z.string({
      required_error: 'The client ID is missing',
      invalid_type_error: 'The client ID is invalid',
    }),
    refresh_token: z.string({
      required_error: 'The refresh token is missing',
      invalid_type_error: 'The refresh token is invalid',
    }),
    scope: z
      .string()
      .optional()
      .refine(
        (value) =>
          typeof value === 'undefined' ||
          value?.split(' ').every((scope) => scopeValidationRegex.test(scope)),
        { message: 'One or more scopes are invalid' },
      )
      .transform((scopes) => scopes?.split(' ')),
  }),

  async validate(data, client) {
    if (data.scope && !data.scope.every((scope) => client.scopes?.includes(scope))) {
      throw new OAuthError('invalid_scope', 'One or more scopes are invalid');
    }

    return data;
  },

  async handle(database, data, client) {
    // region Verify persisted refresh token instance
    let refreshToken: RefreshToken;

    try {
      refreshToken = await loadRefreshToken(database, data.refresh_token);
    } catch {
      throw new OAuthError('invalid_grant', 'The refresh token is invalid or expired');
    }

    if (
      !refreshToken ||
      refreshToken.revoked_at !== null ||
      refreshToken.expires_at <= new Date()
    ) {
      throw new OAuthError('invalid_grant', 'The refresh token is invalid or expired');
    }

    if (refreshToken.client_id !== client.id) {
      throw new OAuthError('invalid_client', 'The client ID is invalid');
    }
    // endregion

    // region Verify scopes
    if (data.scope && !data.scope.every((scope) => refreshToken.scopes.includes(scope))) {
      throw new OAuthError('invalid_scope', 'One or more scopes are invalid');
    }

    const effectiveScopes = data.scope && data.scope.length > 0 ? data.scope : refreshToken.scopes;
    // endregion

    // region Issue token
    const {
      expiresAt,
      accessToken,
      refreshToken: updatedRefreshToken,
    } = await issueTokens(
      database,
      client.id,
      refreshToken.user_id,
      effectiveScopes,
      async (trx) => {
        await revokeRefreshToken(trx, client.id, refreshToken.token);
      },
    );

    const scope = data.scope ? effectiveScopes.join(' ') : undefined;

    return {
      token_type: 'Bearer',
      access_token: accessToken,
      refresh_token: updatedRefreshToken,
      expires_in: offsetInSeconds(expiresAt),
      scope,
    } satisfies TokenPayload;
    // endregion
  },
});
