import { authorizationCodeGrant } from '$lib/server/auth/oauth/grantTypes/authorizationCodeGrant';
import { clientCredentialsGrant } from '$lib/server/auth/oauth/grantTypes/clientCredentialsGrant';
import { refreshTokenGrant } from '$lib/server/auth/oauth/grantTypes/refreshTokenGrant';
import { deviceCodeGrant } from '$lib/server/auth/oauth/grantTypes/deviceCodeGrant';
import type { OAuthResponseType, PkceCodeChallengeMethod } from '$lib/server/auth/oauth/types';

export const grantTypes = [
  authorizationCodeGrant,
  clientCredentialsGrant,
  refreshTokenGrant,
  deviceCodeGrant,
] as const;

export const supportedResponseTypes = ['code'] satisfies [OAuthResponseType, ...OAuthResponseType[]];
export const supportedCodeChallengeMethods = ['S256'] satisfies [PkceCodeChallengeMethod, ...PkceCodeChallengeMethod[]];

export const authorizationEndpoint = '/auth/oauth/authorize';
export const tokenEndpoint = '/auth/oauth/token';
export const revocationEndpoint = '/auth/oauth/token/revoke';
export const clientRegistrationEndpoint = '/auth/oauth/register';
export const userInfoEndpoint = '/auth/oauth/userinfo';
export const deviceAuthorizationEndpoint = '/auth/oauth/device';
export const introspectionEndpoint = '/auth/oauth/tokeninfo';
export const pushedAuthorizationRequestEndpoint = '/auth/oauth/par';
export const jwksUri = '/auth/oauth/jwks';
export const documentationUri = '/help/oauth';
export const termsOfServiceUri = '/help/terms';
export const policyUri = '/help/policy';
