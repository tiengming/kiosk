import { undefined, z } from 'zod';
import { scopeValidationRegex } from '$lib/server/data/authentication/oauth';
import { hash, timingSafeEqual } from '$lib/server/crypto';
import { encodeToBase64 } from '$lib/utilities';
import { OAuthError } from '$lib/server/auth/oauth/OAuthError';
import { createGrantType, issueTokens, offsetInSeconds } from '$lib/server/auth/oauth/utilities';
import type { TokenPayload } from '$lib/server/auth/oauth/types';

export const clientCredentialsGrant = createGrantType({
  type: 'client_credentials',

  schema: z
    .object({
      grant_type: z.literal('client_credentials', {
        message: 'The grant type is missing or invalid',
      }),
      client_id: z.string({
        required_error: 'The client ID is missing',
        invalid_type_error: 'The client ID is invalid',
      }),
      client_secret: z.string({
        required_error: 'The client secret is missing',
        invalid_type_error: 'The client secret is invalid',
      }),
      scope: z
        .string()
        .optional()
        .refine(
          (value) =>
            typeof value === 'undefined' ||
            value?.split(' ').every((scope) => scopeValidationRegex.test(scope)),
          {
            message: 'One or more scopes are invalid',
          },
        )
        .transform((scopes) => scopes?.split(' ')),
    })
    .superRefine((data, context) => {
      if (!data.client_id) {
        context.addIssue({
          code: 'custom',
          path: ['client_id'],
          message: 'The client ID is missing',
          params: { oauth_error: 'invalid_request' },
        });
      }

      if (!data.client_secret) {
        context.addIssue({
          code: 'custom',
          path: ['client_secret'],
          message: 'The client secret is missing',
          params: { oauth_error: 'invalid_request' },
        });
      }
    }),

  async validate(data, client) {
    if (client.redirect_uris !== null || client.secret === null) {
      throw new OAuthError('invalid_client', 'The client ID is invalid');
    }

    const secretHash = encodeToBase64(await hash(data.client_secret), true, false);

    if (!(await timingSafeEqual(secretHash, client.secret))) {
      throw new OAuthError('invalid_request', 'The client secret is missing or invalid');
    }

    if (data.scope && !data.scope.every((s) => client.scopes?.includes(s))) {
      throw new OAuthError('invalid_scope', 'One or more scopes are invalid');
    }

    return data;
  },

  async handle(database, { scope: requestedScope }, client) {
    const {
      accessToken,
      refreshToken,
      expiresAt,
      scopes: grantedScopes,
    } = await issueTokens(database, client.id, null, requestedScope ?? []);

    // The type cast is necessary for some kind of type inference bug here
    const scope = (grantedScopes.length > 0 ? grantedScopes.join(' ') : undefined) as
      | string
      | undefined;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: offsetInSeconds(expiresAt),
      scope,
    } satisfies TokenPayload;
  },
});
