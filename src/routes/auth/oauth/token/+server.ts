import type { RequestHandler } from './$types';
import { z, ZodError } from 'zod';
import { loadClient } from '$lib/server/data/authentication/oauth';
import { authorizationCodeGrant } from '$lib/server/auth/oauth/grantTypes/authorizationCodeGrant';
import { refreshTokenGrant } from '$lib/server/auth/oauth/grantTypes/refreshTokenGrant';
import { clientCredentialsGrant } from '$lib/server/auth/oauth/grantTypes/clientCredentialsGrant';
import { deviceCodeGrant } from '$lib/server/auth/oauth/grantTypes/deviceCodeGrant';
import { json } from '@sveltejs/kit';
import { OAuthError } from '$lib/server/auth/oauth/OAuthError';
import type { Client, GrantType } from '$lib/server/auth/oauth/types';
import { handleOAuthValidationErrors, oauthError } from '$lib/server/auth/oauth/response';

export const prerender = false;

const grantTypes = [
  authorizationCodeGrant,
  clientCredentialsGrant,
  refreshTokenGrant,
  deviceCodeGrant,
  // tokenExchangeGrant
];

type SupportedGrantType = GrantType<never>['type'];

const tokenRequestSchema = z.intersection(
  z.object({
    grant_type: z.enum<SupportedGrantType, [SupportedGrantType, ...SupportedGrantType[]]>(
      [
        clientCredentialsGrant.type,
        authorizationCodeGrant.type,
        refreshTokenGrant.type,
        deviceCodeGrant.type,
        // Not supported (yet?)
        // 'urn:ietf:params:oauth:grant-type:token-exchange',
      ],
      {
        required_error: 'The grant type is missing',
        invalid_type_error: 'The grant type is not supported',
      },
    ),
  }),
  z.record(z.string(), z.string()),
);

export const POST = async function handle({ request, locals: { database } }) {
  let body: FormData;

  try {
    body = await request.formData();
  } catch {
    return oauthError(
      'invalid_request',
      'The request content type must be application/x-www-form-urlencoded',
    );
  }

  // region Resolve the client
  const clientId = z
    .string({ message: 'The client ID is missing or invalid' })
    .safeParse(body.get('client_id'));

  if (!clientId.success) {
    return oauthError('invalid_client', clientId.error);
  }

  let client: Client;

  try {
    client = await loadClient(database, clientId.data);
  } catch {
    return oauthError('invalid_client', 'The client ID is missing or invalid');
  }

  if (!client.active || client.revoked) {
    return oauthError('invalid_client', 'The client ID is missing or invalid');
  }
  // endregion

  try {
    const payload = tokenRequestSchema.parse(Object.fromEntries(body.entries()));

    // At this point, we can resolve the grant type from the list of supported grant types, because
    // we are sure the payload matches the simple payload schema.
    const grant = grantTypes.find(({ type }) => type === payload.grant_type)!;
    // const grant = grantTypes[data.grant_type];

    // By validating the data again, against the grant-specific schema, we can make sure the payload
    // matches the data required by the grant-specific validation.
    const data = grant.schema.parse(payload);

    // Apply any post-schema validation steps, such as checking the database for expiration or token
    // revocations that are pending
    // @ts-expect-error -- Typescript can't infer the union type properly here
    const params = await grant.validate(data, client);

    // Finally, let the grant handle the request and generate a token response.
    // @ts-expect-error -- Typescript can't infer the union type properly here
    return json(await grant.handle(database, params, client), {
      headers: {
        'cache-control': 'no-store',
        pragma: 'no-cache',
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleOAuthValidationErrors(error.issues);
    }

    if (error instanceof OAuthError) {
      return oauthError(error.code, error.description, error.uri);
    }

    if (!(error instanceof Error)) {
      throw error;
    }

    const { message } = error;

    return oauthError('server_error', message);
  }
} satisfies RequestHandler;
