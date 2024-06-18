import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { listAllScopes } from '$lib/server/data/authentication/oauth';
import type { AuthorizationServerMetadata } from '$lib/server/auth/oauth/types';
import {
  authorizationEndpoint,
  clientRegistrationEndpoint,
  deviceAuthorizationEndpoint,
  documentationUri,
  grantTypes,
  introspectionEndpoint,
  jwksUri,
  policyUri, pushedAuthorizationRequestEndpoint,
  revocationEndpoint,
  supportedCodeChallengeMethods,
  supportedResponseTypes,
  termsOfServiceUri,
  tokenEndpoint,
  userInfoEndpoint
} from '$lib/server/auth/oauth/configuration';

export const prerender = true;

export const GET = async function handle({ url, locals: { database } }) {
  const scopes = await listAllScopes(database);

  return json({
    issuer: new URL(url.origin),
    authorization_endpoint: new URL(authorizationEndpoint, url),
    token_endpoint: new URL(tokenEndpoint, url),
    introspection_endpoint: new URL(introspectionEndpoint, url),
    revocation_endpoint: new URL(revocationEndpoint, url),
    userinfo_endpoint: new URL(userInfoEndpoint, url),
    registration_endpoint: new URL(clientRegistrationEndpoint, url),
    device_authorization_endpoint: new URL(deviceAuthorizationEndpoint, url),

    // region Pushed Authorization Requests
    pushed_authorization_request_endpoint: new URL(pushedAuthorizationRequestEndpoint, url),
    require_pushed_authorization_requests: false,
    // endregion

    jwks_uri: new URL(jwksUri, url),

    service_documentation: new URL(documentationUri, url),
    op_tos_uri: new URL(termsOfServiceUri, url),
    op_policy_uri: new URL(policyUri, url),

    response_types_supported: supportedResponseTypes,
    code_challenge_methods_supported: supportedCodeChallengeMethods,
    token_endpoint_auth_methods_supported: ['client_secret_post'],
    revocation_endpoint_auth_methods_supported: ['client_secret_basic'],
    introspection_endpoint_auth_methods_supported: ['client_secret_basic'],
    response_modes_supported: ['query'],

    scopes_supported: scopes.map(({ id }) => id),
    grant_types_supported: grantTypes.map(({ type }) => type),

    // TODO: Locale Support
    ui_locales_supported: ['en_US'],
  } satisfies AuthorizationServerMetadata);
} satisfies RequestHandler;
