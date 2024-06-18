import { z } from 'zod';
import { loadAuthorizationCode } from '$lib/server/data/authentication/oauth';
import { encodeToBase64 } from '$lib/utilities';
import { hash, timingSafeEqual } from '$lib/server/crypto';
import { OAuthError } from '$lib/server/auth/oauth/OAuthError';
import { createGrantType, issueTokens, offsetInSeconds } from '$lib/server/auth/oauth/utilities';
import type { AuthorizationCode, TokenPayload } from '$lib/server/auth/oauth/types';

export const authorizationCodeGrant = createGrantType({
  type: 'authorization_code',

  schema: z.object({
    grant_type: z.literal('authorization_code', {
      message: 'The grant type is invalid',
    }),
    client_id: z.string({
      required_error: 'The client ID is missing',
      invalid_type_error: 'The client ID is invalid',
    }),
    redirect_uri: z
      .string({
        required_error: 'The redirect URI is missing',
        invalid_type_error: 'The redirect URI is invalid',
      })
      .url({ message: 'The redirect URI is not a valid URL' }),
    code: z.string({
      required_error: 'The authorization code is missing',
      invalid_type_error: 'The authorization code is invalid',
    }),
    code_verifier: z.string({
      required_error: 'The PKCE code verifier is missing',
      invalid_type_error: 'The PKCE code verifier is invalid',
    }),
  }),

  validate(data, client) {
    // Confidential clients may not issue authorization code grant tokens
    if (!client.redirect_uris) {
      throw new OAuthError('invalid_client', 'The client ID is invalid');
    }

    return data;
  },

  async handle(database, data, client) {
    // region Validate persisted authorization code instance
    let authorizationCode: AuthorizationCode;

    try {
      authorizationCode = await loadAuthorizationCode(database, data.code);
    } catch {
      throw new OAuthError('invalid_grant', 'The authorization code is missing or invalid');
    }

    if (authorizationCode.revoked) {
      throw new OAuthError('invalid_grant', 'The authorization code has been revoked');
    }

    if (authorizationCode.expires_at <= new Date()) {
      throw new OAuthError('invalid_grant', 'The authorization code has expired');
    }

    if (authorizationCode.redirect_uri !== data.redirect_uri) {
      throw new OAuthError('invalid_grant', 'The redirect URI is missing or invalid');
    }

    if (authorizationCode.code !== data.code) {
      throw new OAuthError('invalid_grant', 'The authorization code is invalid');
    }
    // endregion

    // region Validate client restrictions
    if (
      // Ensure the authorization code isn't used with another client
      authorizationCode.client_id !== client.id ||
      // Personal clients may only be used by their owner
      (client.personal && authorizationCode.user_id !== client.user_id)
    ) {
      throw new OAuthError('invalid_client', 'The client ID is invalid');
    }
    // endregion

    // region Validate PKCE challenge
    const verifierHash = encodeToBase64(await hash(data.code_verifier), true, false);

    if (!(await timingSafeEqual(verifierHash, authorizationCode.challenge))) {
      throw new OAuthError('invalid_grant', 'The code verifier is invalid');
    }
    // endregion

    // region Issue token
    const { accessToken, refreshToken, expiresAt, scopes } = await issueTokens(
      database,
      client.id,
      authorizationCode.user_id,
      authorizationCode.scopes,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: offsetInSeconds(expiresAt),
      scope: scopes.join(' '),
    } satisfies TokenPayload;
    // endregion
  },
});
