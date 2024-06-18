import { z } from 'zod';
import { OAuthAuthorizationError, OAuthError } from '$lib/server/auth/oauth/OAuthError';
import {
  supportedCodeChallengeMethods,
  supportedResponseTypes,
} from '$lib/server/auth/oauth/configuration';
import {
  loadAuthorizationRequest,
  loadClient,
  loadScopes,
  scopeValidationRegex,
} from '$lib/server/data/authentication/oauth';
import type { Client as Database } from '$lib/server/database';
import type { Client } from '$lib/server/auth/oauth/types';
import { NoResultError } from 'kysely';

export async function validateAuthorization(
  database: Database,
  data: Record<string, unknown>,
  allowAuthorizationRequest = false,
) {
  // region Validate Client ID and Redirect URI
  const initialPayload = z
    .object({
      client_id: z.string({
        invalid_type_error: 'The client ID is invalid',
        required_error: 'The client ID is missing',
      }),
      redirect_uri: z
        .string({
          invalid_type_error: 'The redirect URI is invalid',
          required_error: 'The redirect URI is missing',
        })
        .url({ message: 'The redirect URI is not a valid URI' })
        .superRefine((uri, context) => {
          // Localhost URIs are allowed for development purposes
          if (uri.startsWith('http://localhost')) {
            return;
          }

          // Private-use URIs are allowed for native client scenarios, where the request will never
          // leave the device
          if (uri.match(/^[a-z][a-z0-9.-]\.[a-z][a-z0-9.-]:\/.+/)) {
            return;
          }

          if (!uri.startsWith('https://')) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'The redirect URI must use HTTPS',
            });
          }
        }),
      state: z.string().optional(),
      request_uri: z
        .string({ message: 'The request URI is invalid' })
        .url({ message: 'The request URI is not a valid URI' })
        .optional()
        .refine((uri) => !(uri && !uri.startsWith('urn:ietf:params:oauth:request_uri:')), {
          message: 'The request URI must use the "urn:ietf:params:oauth:request_uri" URN scheme',
        })
        .transform((uri) => uri?.replace('urn:ietf:params:oauth:request_uri:', '')),
    })
    .safeParse(data);

  // If validation of either client ID or redirect URI fails, we'll show the plain error message
  // in the browser; while this isn't all too pleasant for the user, it's necessary to prevent a
  // Kiosk instance from being used as an open relay: You could simply redirect users to any
  // malicious URL by setting it as an invalid redirect URI otherwise.
  if (!initialPayload.success) {
    const issue = initialPayload.error.issues.shift()!;

    throw new OAuthError('invalid_request', issue.message);
  }
  // endregion

  // region Handle PAR Authorization Requests
  if (allowAuthorizationRequest && initialPayload.data.request_uri) {
    try {
      const {
        client_id: clientId,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        redirect_uri: redirectUri,
        response_type: responseType,
        scopes,
        state,
      } = await loadAuthorizationRequest(database, initialPayload.data.request_uri);

      return {
        clientId,
        codeChallenge,
        codeChallengeMethod,
        redirectUri,
        responseType,
        scopes: scopes ?? [],
        state: state ?? undefined,
      };
    } catch (error) {
      if (error instanceof NoResultError) {
        throw new OAuthError('invalid_request', 'The request URI is unknown or expired');
      }

      throw new OAuthError('server_error');
    }
  }
  // endregion

  // region Validate Client
  const { client_id: clientId, redirect_uri: redirectUri, state } = initialPayload.data;
  const client = await validateClient(database, clientId, redirectUri);
  // endregion

  // region Validate Authorization Request Parameters
  const payload = z
    .object({
      response_type: z.enum(supportedResponseTypes, {
        invalid_type_error: 'The response type is unknown or unsupported',
        required_error: 'The response type is missing',
      }),
      code_challenge: z.string({ message: 'A PKCE code challenge is required' }),
      code_challenge_method: z.enum(supportedCodeChallengeMethods, {
        invalid_type_error: 'The code challenge method is unknown or unsupported',
        required_error: 'The code challenge method is missing',
      }),
      scope: z
        .string({ message: 'The scope is missing' })
        .transform((scope) => scope.split(' '))
        .pipe(
          z
            .string({ message: 'The scope is invalid' })
            .regex(scopeValidationRegex, { message: 'The scope is invalid' })
            .array(),
        ),
    })
    .safeParse(data);

  if (!payload.success) {
    const issue = payload.error.issues.shift()!;
    const field = issue.path[0]!.toString();

    if (field === 'response_type' && issue.code === z.ZodIssueCode.invalid_enum_value) {
      throw new OAuthAuthorizationError(
        'unsupported_response_type',
        redirectUri,
        state,
        issue.message,
      );
    }

    if (field === 'scope' && issue.code === z.ZodIssueCode.invalid_string) {
      throw new OAuthAuthorizationError('invalid_scope', redirectUri, state, issue.message);
    }

    throw new OAuthAuthorizationError('invalid_request', redirectUri, state, issue.message);
  }
  // endregion

  const {
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    response_type: responseType,
    scope: requestedScopes,
  } = payload.data;

  // region Validate Scopes
  let scopes: string[];

  try {
    scopes = await resolveScopes(database, client, requestedScopes);
  } catch (error) {
    if (error instanceof OAuthError) {
      throw new OAuthAuthorizationError(
        error.code,
        redirectUri,
        state,
        error.description,
        error.uri,
      );
    }

    throw new OAuthAuthorizationError('invalid_scope', redirectUri, state, 'The scope is invalid');
  }
  // endregion

  return {
    clientId: client.id,
    codeChallenge,
    codeChallengeMethod,
    redirectUri,
    responseType,
    scopes,
    state,
  };
}

async function validateClient(database: Database, clientId: string, redirectUri: string) {
  let client: Client;

  try {
    client = await loadClient(database, clientId);
  } catch {
    throw new OAuthError('invalid_request', 'The client ID is missing or invalid');
  }

  if (!client.redirect_uris) {
    throw new OAuthError(
      'invalid_client',
      'The client is confidential and does not support the authorization_code grant',
    );
  }

  if (!client.redirect_uris.includes(redirectUri)) {
    throw new OAuthError('invalid_request', 'The redirect URI is missing or invalid');
  }

  return client;
}

async function resolveScopes(database: Database, client: Client, scopes: string[]) {
  let knownScopes: Awaited<ReturnType<typeof loadScopes>>;

  try {
    knownScopes = await loadScopes(database, scopes);
  } catch {
    throw new OAuthError('invalid_scope', 'The scope is invalid');
  }

  const unknownScopes = scopes.filter((scope) => !knownScopes.some(({ id }) => scope === id));

  if (unknownScopes.length > 0) {
    throw new OAuthError(
      'invalid_scope',
      `The scope is invalid: Check the "${unknownScopes.join('", "')}" scope${unknownScopes.length > 1 ? 's' : ''}`,
    );
  }

  return scopes.filter((scope) => client.scopes.includes(scope));
}
