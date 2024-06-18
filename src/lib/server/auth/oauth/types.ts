import {
  loadAccessToken,
  loadAuthorizationCode,
  loadClient,
  loadDeviceChallenge,
  loadRefreshToken,
  loadUserConsent,
} from '$lib/server/data/authentication/oauth';
import { findUserByIdentifier } from '$lib/server/data/authentication/user';
import { z, type ZodType } from 'zod';
import type { MaybePromise } from '$lib/utilities';
import type { Client as Database } from '$lib/server/database';

// region Specification
/**
 * **OAuth 2.0 Authorization Server Metadata**
 *
 * This specification defines a metadata format that an OAuth 2.0 client can use to obtain the
 * information needed to interact with an OAuth 2.0 authorization server, including its endpoint
 * locations and authorization server capabilities.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc8414|RFC 8414
 */
export interface AuthorizationServerMetadata {
  /**
   * OPTIONAL. JSON array containing a list of the OAuth 2.0 grant type values that this
   * authorization server supports. The array values used are the same as those used with the
   * `grant_types` parameter defined by OAuth 2.0 Dynamic Client Registration Protocol
   * ({@link https://datatracker.ietf.org/doc/html/rfc7591|RFC 7591}). If omitted, the default
   * value is `["authorization_code", "implicit"]`.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  grant_types_supported?: OAuthGrantType[];

  /**
   * REQUIRED. The authorization server's issuer identifier, which is a URL that uses the `https`
   * scheme and has no query or fragment components. Authorization server metadata is published at a
   * location that is `.well-known` according
   * to {@link https://datatracker.ietf.org/doc/html/rfc5785|RFC 5785} derived from this issuer
   * identifier, as described
   * in {@link https://datatracker.ietf.org/doc/html/rfc8414#section-3|Section 3}.
   * The issuer identifier is used to prevent authorization server mix-up attacks, as described
   * in {@link https://datatracker.ietf.org/doc/html/rfc8414#ref-MIX-UP|OAuth 2.0 Mix-Up
   * Mitigation}.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  issuer: `https://${string}` | URL;

  /**
   * URL of the authorization server's authorization endpoint as
   * per {@link https://datatracker.ietf.org/doc/html/rfc6749|RFC6749}.
   * This is REQUIRED unless no grant types are supported that use the authorization endpoint.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  authorization_endpoint: `https://${string}` | URL;

  /**
   * URL of the authorization server's token endpoint as
   * per {@link https://datatracker.ietf.org/doc/html/rfc6749|RFC6749}.
   * This is REQUIRED unless only the implicit grant type is supported.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  token_endpoint: `https://${string}` | URL;

  /**
   * OPTIONAL. URL of the authorization
   * server's {@link https://datatracker.ietf.org/doc/html/rfc8414#ref-JWK|JWK Set document}.
   * The referenced document contains the signing key(s) the client uses to validate signatures from
   * the authorization server. This URL *MUST* use the `https` scheme. The JWK Set *MAY* also
   * contain the server's encryption key or keys, which are used by clients to encrypt requests to
   * the server. When both signing and encryption keys are made available, a `use` (public key use)
   * parameter value is REQUIRED for all keys in the referenced JWK Set to indicate each key's
   * intended usage.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  jwks_uri?: `https://${string}` | URL;

  /**
   * OPTIONAL. URL of the authorization server's
   * OAuth 2.0 {@link https://datatracker.ietf.org/doc/html/rfc7591|Dynamic Client Registration
   * endpoint}.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  registration_endpoint?: `https://${string}` | URL;

  /**
   * OPTIONAL. URL of the authorization server's
   * OAuth 2.0 {@link https://openid.net/specs/openid-connect-core-1_0.html#UserInfo|User
   * Information endpoint}.
   *
   * @see https://openid.net/specs/openid-connect-core-1_0.html#UserInfo OpenID Connect Core 1.0:
   *      UserInfo Endpoint
   */
  userinfo_endpoint?: `https://${string}` | URL;

  /**
   * RECOMMENDED. JSON array containing a list of the OAuth 2.0
   * {@link https://datatracker.ietf.org/doc/html/rfc6749|RFC 6749} `scope` values that this
   * authorization server supports.
   * Servers *MAY* choose not to advertise some supported scope values even when this parameter
   * is used.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  scopes_supported?: string[];

  /**
   * REQUIRED. JSON array containing a list of the OAuth 2.0 `response_type` values that this
   * authorization server supports.
   * The array values used are the same as those used with the `response_types` parameter defined by
   * OAuth 2.0 {@link https://datatracker.ietf.org/doc/html/rfc7591|Dynamic Client Registration
   * Protocol}.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   * @see https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#endpoint IANA
   *      OAuth Parameters Registry: OAuth Authorization Endpoint Response Types
   */
  response_types_supported: OAuthResponseType[];

  /**
   * OPTIONAL. JSON array containing a list of the OAuth 2.0 `response_mode` values that this
   * authorization server supports, as specified
   * in {@link https://datatracker.ietf.org/doc/html/rfc8414#ref-OAuth.Responses|OAuth 2.0 Multiple
   * Response Type Encoding Practices}.
   * If omitted, the default is `["query", "fragment"]`. The response mode value `form_post` is also
   * defined
   * in {@link https://datatracker.ietf.org/doc/html/rfc8414#ref-OAuth.Post|OAuth 2.0 Form Post
   * Response Mode}.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  response_modes_supported?: ResponseMode[];

  /**
   * OPTIONAL. JSON array containing a list of client authentication methods supported by this token
   * endpoint. Client authentication method values are used in the `token_endpoint_auth_method`
   * parameter defined
   * in {@link https://datatracker.ietf.org/doc/html/rfc7591#section-2|Section 2 of RFC 7591}.
   * If omitted, the default is `client_secret_basic` — the HTTP Basic Authentication
   * Scheme specified
   * in {@link https://datatracker.ietf.org/doc/html/rfc8414#section-2.3.1|Section 2.3.1 of OAuth
   * 2.0 RFC 6749}.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   * @see https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method IANA
   *      OAuth Parameters Registry: Token Endpoint Authentication Methods
   */
  token_endpoint_auth_methods_supported?: TokenEndpointAuthenticationMethod[];

  /**
   * OPTIONAL. JSON array containing a list of the JWS signing algorithms (`alg` values) supported
   * by the token endpoint for the signature on
   * the {@link https://datatracker.ietf.org/doc/html/rfc8414#ref-JWT|JWT} used to authenticate the
   * client at the token endpoint for the `private_key_jwt` and `client_secret_jwt`
   * authentication methods.
   * This metadata entry *MUST* be present if either of these authentication methods are specified
   * in the `token_endpoint_auth_methods_supported` entry. No default algorithms are implied if this
   * entry is omitted. Servers *SHOULD* support `RS256`. The value `none` *MUST NOT* be used.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   * @see https://datatracker.ietf.org/doc/html/rfc7519#section-8 RFC 7519, Section 8
   * @see https://datatracker.ietf.org/doc/html/rfc7518#autoid-5 RFC 7518
   */
  token_endpoint_auth_signing_alg_values_supported?: JwtSigningAlgorithm[];

  /**
   * OPTIONAL. URL of a page containing human-readable information that developers might want or
   * need to know when using the authorization server. If the authorization server does not support
   * Dynamic Client Registration, then information on how to register clients needs to be provided
   * in this documentation.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  service_documentation?: `https://${string}` | URL;

  /**
   * OPTIONAL. Languages and scripts supported for the user interface, represented as a JSON array
   * of language tag values
   * from {@link https://datatracker.ietf.org/doc/html/bcp47|BCP 47 (RFC 5646)}. If omitted, the set
   * of supported languages and scripts is unspecified.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  ui_locales_supported?: string[];

  /**
   * OPTIONAL. URL that the authorization server provides to the person registering the client to
   * read about the authorization server's requirements on how the client can use the data provided
   * by the authorization server. The registration process *SHOULD* display this URL to the person
   * registering the client if it is given. As described
   * in {@link https://datatracker.ietf.org/doc/html/rfc8414#section-5|Section 5}, despite the
   * identifier `op_policy_uri` appearing to be OpenID-specific, its usage in this specification is
   * actually referring to a general OAuth 2.0 feature that is not specific to OpenID Connect.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  op_policy_uri?: `https://${string}` | URL;

  /**
   * OPTIONAL. URL that the authorization server provides to the person registering the client to
   * read about the authorization server's terms of service. The registration process *SHOULD*
   * display this URL to the person registering the client if it is given. As described
   * in {@link https://datatracker.ietf.org/doc/html/rfc8414#section-5|Section 5}, despite the
   * identifier `op_tos_uri` appearing to be OpenID-specific, its usage in this specification is
   * actually referring to a general OAuth 2.0 feature that is not specific to OpenID Connect.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  op_tos_uri?: `https://${string}` | URL;

  /**
   * OPTIONAL. URL of the authorization server's
   * OAuth 2.0 {@link https://datatracker.ietf.org/doc/html/rfc7009|revocation endpoint (RFC 7009)}.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  revocation_endpoint?: `https://${string}` | URL;

  /**
   * OPTIONAL. JSON array containing a list of client authentication methods supported by this
   * revocation endpoint. The valid client authentication method values are those registered in the
   * {@link https://datatracker.ietf.org/doc/html/rfc8414#ref-IANA.OAuth.Parameters|IANA OAuth Token
   * Endpoint Authentication Methods registry}. If omitted, the default
   * is `client_secret_basic` — the HTTP Basic Authentication Scheme specified in
   * {@link https://datatracker.ietf.org/doc/html/rfc8414#section-2.3.1|Section 2.3.1} of OAuth 2.0
   * ({@link https://datatracker.ietf.org/doc/html/rfc8414|RFC 6749}).
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   * @see https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method IANA
   *      OAuth Parameters Registry: Token Endpoint Authentication Methods
   */
  revocation_endpoint_auth_methods_supported?: TokenEndpointAuthenticationMethod[];

  /**
   * OPTIONAL. JSON array containing a list of the JWS signing algorithms (`alg` values) supported
   * by the revocation endpoint for the signature on
   * the {@link https://datatracker.ietf.org/doc/html/rfc8414#ref-JWT|JWT} used to authenticate the
   * client at the revocation endpoint for the `private_key_jwt` and `client_secret_jwt`
   * authentication methods. This metadata entry *MUST* be present if either of these authentication
   * methods are specified in the `revocation_endpoint_auth_methods_supported` entry. No default
   * algorithms are implied if this entry is omitted. The value `none` *MUST NOT* be used.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   * @see https://datatracker.ietf.org/doc/html/rfc7519#section-8 RFC 7519, Section 8
   * @see https://datatracker.ietf.org/doc/html/rfc7518#autoid-5 RFC 7518
   */
  revocation_endpoint_auth_signing_alg_values_supported?: JwtSigningAlgorithm[];

  /**
   * OPTIONAL. URL of the authorization server's
   * OAuth 2.0 {@link https://datatracker.ietf.org/doc/html/rfc7662|introspection endpoint (RFC
   * 7662)}.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   */
  introspection_endpoint?: `https://${string}` | URL;

  /**
   * OPTIONAL. JSON array containing a list of client authentication methods supported by this
   * introspection endpoint. The valid client authentication method values are those registered in
   * the {@link https://datatracker.ietf.org/doc/html/rfc8414#ref-IANA.OAuth.Parameters|IANA OAuth
   * Token Endpoint Authentication Methods registry} or
   * those registered in
   * the {@link https://datatracker.ietf.org/doc/html/rfc8414#ref-IANA.OAuth.Parameters|IANA OAuth
   * Access Token Types registry} (These values are and will remain distinct, due to Section 7.2.)
   * If omitted, the set of supported authentication methods *MUST* be determined by other means.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   * @see https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-types IANA
   *      OAuth Parameters Registry: OAuth Access Token Types
   */
  introspection_endpoint_auth_methods_supported?: TokenEndpointAuthenticationMethod[];

  /**
   * OPTIONAL. JSON array containing a list of the JWS signing algorithms (`alg` values) supported
   * by the introspection endpoint for the signature on
   * the {@link https://datatracker.ietf.org/doc/html/rfc8414#ref-JWT|JWT} used to authenticate the
   * client at the introspection endpoint for the `private_key_jwt` and `client_secret_jwt`
   * authentication methods. This metadata entry *MUST* be present if either of these authentication
   * methods are specified in the `introspection_endpoint_auth_methods_supported` entry. No default
   * algorithms are implied if this entry is omitted. The value `none` *MUST NOT* be used.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   * @see https://datatracker.ietf.org/doc/html/rfc7519#section-8 RFC 7519, Section 8
   * @see https://datatracker.ietf.org/doc/html/rfc7518#autoid-5 RFC 7518
   */
  introspection_endpoint_auth_signing_alg_values_supported?: JwtSigningAlgorithm[];

  /**
   * OPTIONAL. JSON array containing a list
   * of {@link https://datatracker.ietf.org/doc/html/rfc7636|Proof Key for Code Exchange (PKCE)
   * (RFC 7636)} code challenge methods supported by this authorization server. Code challenge
   * method values are used in the `code_challenge_method` parameter defined
   * in {@link https://datatracker.ietf.org/doc/html/rfc7636#section-4.3|Section 4.3}
   * of {@link https://datatracker.ietf.org/doc/html/rfc7636|RFC 7636}. The valid code challenge
   * method values are those registered in
   * the {@link https://datatracker.ietf.org/doc/html/rfc8414#ref-IANA.OAuth.Parameters|IANA PKCE
   * Code Challenge Methods registry}. If omitted, the authorization server does not support PKCE.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8414#section-2 RFC 8414, Section 2
   * @see https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#pkce-code-challenge-method IANA OAuth
   *      Parameters Registry: PKCE Code Challenge Methods
   */
  code_challenge_methods_supported?: PkceCodeChallengeMethod[];

  /**
   * OPTIONAL. URL of the authorization server's device authorization endpoint, as defined
   * in {@link https://datatracker.ietf.org/doc/html/rfc8628#section-3.1|Section 3.1}.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8628#section-3.1 RFC 8628, Section 3.1
   * @see https://datatracker.ietf.org/doc/html/rfc8628 RFC 8628
   * @see https://datatracker.ietf.org/doc/html/rfc8414 RFC 8414
   */
  device_authorization_endpoint?: `https://${string}` | URL;

  /**
   * The URL of the pushed authorization request endpoint at which a client can post an
   * authorization request to exchange for a request_uri value usable at the authorization server.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc9126#autoid-11 RFC 9126, Section 5
   * @see https://datatracker.ietf.org/doc/html/rfc9126 RFC 9126
   */
  pushed_authorization_request_endpoint?: `https://${string}` | URL;

  /**
   * Boolean parameter indicating whether the authorization server accepts authorization request
   * data only via PAR. If omitted, the default value is false.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc9126#autoid-11 RFC 9126, Section 5
   * @see https://datatracker.ietf.org/doc/html/rfc9126 RFC 9126
   */
  require_pushed_authorization_requests?: boolean;
}

/**
 * **OAuth Authorization Grant Type identifiers as**
 * **per {@link https://datatracker.ietf.org/doc/html/rfc6749|RFC 6749}**
 *
 * An authorization grant is a credential representing the resource owner's authorization (to access
 * its protected resources) used by the client to obtain an access token.  This specification
 * defines four grant types—authorization code, implicit, resource owner password credentials, and
 * client credentials—as well as an extensibility mechanism for defining additional types.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6749 RFC 6749
 * @see https://oauth.net/2/grant-types/ OAuth 2.0 Grant Types
 */
export type OAuthGrantType =
  | 'authorization_code'
  | 'client_credentials'
  | 'refresh_token'
  | 'urn:ietf:params:oauth:grant-type:device_code'
  | 'urn:ietf:params:oauth:grant-type:token-exchange'
  | 'implicit'
  | 'password';

/**
 * OAuth Authorization Endpoint Response Types
 *
 * @see https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#endpoint
 */
export type OAuthResponseType =
  | 'code'
  | 'code id_token'
  | 'code id_token token'
  | 'code token'
  | 'id_token'
  | 'id_token token'
  | 'none'
  | 'token';
type ResponseMode = 'query' | 'fragment' | 'form_post';
type TokenEndpointAuthenticationMethod =
  | 'none'
  | 'client_secret_post'
  | 'client_secret_basic'
  | 'client_secret_jwt'
  | 'private_key_jwt'
  | 'tls_client_auth'
  | 'self_signed_tls_client_auth';
type AccessTokenType = 'Bearer' | 'N_A' | 'PoP' | 'DPoP';
type JwtSigningAlgorithm = 'HS256' | 'RS256' | 'ES256' | 'none';
export type PkceCodeChallengeMethod = 'plain' | 'S256';

export type OAuthErrorCode =
  // The request is missing a parameter so the server can’t proceed with the request. This may also
  // be returned if the request includes an unsupported parameter or repeats a parameter.
  | 'invalid_request'

  // Client authentication failed, such as if the request contains an invalid client ID or secret.
  // Send an HTTP 401 response in this case.
  | 'invalid_client'

  // The authorization code (or user’s password for the password grant type) is invalid or expired.
  // This is also the error you would return if the redirect URL given in the authorization grant
  // does not match the URL provided in this access token request.
  | 'invalid_grant'

  // For access token requests that include a scope (password or client_credentials grants), this
  // error indicates an invalid scope value in the request.
  | 'invalid_scope'

  // This client is not authorized to use the requested grant type. For example, if you restrict
  // which applications can use the Implicit grant, you would return this error for the other apps.
  | 'unauthorized_client'

  // If a grant type is requested that the authorization server doesn’t recognize, use this code.
  // Note that unknown grant types also use this specific error code rather than using
  // the invalid_request above.
  | 'unsupported_grant_type'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'access_denied'
  | 'unsupported_response_type'

  // If the device is polling too frequently when using the device code grant
  | 'slow_down'

  // If the user has not either allowed or denied the request yet, the authorization server will
  // return the authorization_pending error.
  | 'authorization_pending'

  // If the device code is expired
  | 'expired_token';

/**
 * **Successful Token Response**
 *
 * The authorization server issues an access token and optional refresh token, and constructs the
 * response by adding the following parameters to the entity-body of the HTTP response with a
 * `200 (OK)` status code.
 *
 * *Note: In Kiosk, the refresh token is mandatory for all grant types.*
 *
 * @see RFC 6749, Section 5.1
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
 */
export interface TokenPayload {
  /**
   * REQUIRED. The type of the token issued as described
   * in {@link https://datatracker.ietf.org/doc/html/rfc6749#section-7.1|Section 7.1}.
   * Value is case-insensitive.
   *
   * *Note: Kiosk currently only supports opaque Bearer tokens.*
   *
   * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
   */
  token_type: AccessTokenType;

  /**
   * REQUIRED. The access token issued by the authorization server.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
   */
  access_token: string;

  /**
   * OPTIONAL. The refresh token, which can be used to obtain new access tokens using the same
   * authorization grant as described
   * in {@link https://datatracker.ietf.org/doc/html/rfc6749#section-6|Section 6}.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
   */
  refresh_token: string;

  /**
   * RECOMMENDED. The lifetime in seconds of the access token. For example, the value `"3600"`
   * denotes that the access token will expire in one hour from the time the response was generated.
   * If omitted, the authorization server *SHOULD* provide the expiration time via other means or
   * document the default value.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
   */
  expires_in: number;

  /**
   * OPTIONAL, if identical to the scope requested by the client; otherwise, REQUIRED. The scope of
   * the access token as described
   * by {@link https://datatracker.ietf.org/doc/html/rfc6749#section-3.3|Section 3.3}.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
   */
  scope?: string | undefined;
}

// endregion

// region Entities
export type Client = Awaited<ReturnType<typeof loadClient>>;
export type Consent = Awaited<ReturnType<typeof loadUserConsent>>;
export type AuthorizationCode = Awaited<ReturnType<typeof loadAuthorizationCode>>;
export type User = Awaited<ReturnType<typeof findUserByIdentifier>>;
export type AccessToken = Awaited<ReturnType<typeof loadAccessToken>>;
export type RefreshToken = Awaited<ReturnType<typeof loadRefreshToken>>;
export type DeviceChallenge = Awaited<ReturnType<typeof loadDeviceChallenge>>;
// endregion

/**
 * **OAuth Grant Type Handler**
 *
 * A grant handler implements validation and request handling for a
 * given {@link OAuthGrantType|OAuth grant type}. It exposes a {@link https://zod.dev|Zod} schema
 * for the request payload that will be validated bef
 *
 * All token requests will be handled like such:
 *  1. Request headers will be checked
 *  2. The payload will be parsed against the grant type schema
 *  3. The client will be resolved from the `client_id` parameter
 *  4. `validate()` will be called with the schema parsing result and client data
 *  5. `handle()` will be called with the `validate()` result, database instance, and client data
 *
 * If the request is invalid for any reason, or a token cannot be issued, both `validate()`
 * and `handle()` should throw an {@link OAuthError} if an expected error occurs, or return
 * a {@link TokenPayload} object on success.
 */
export type GrantType<T extends ZodType, U = z.TypeOf<T>> = {
  /**
   * Grant Type identifier this grant handles
   *
   * @see OAuthGrantType
   */
  type: string & OAuthGrantType;

  /**
   * Zod Schema to validate requests against
   */
  schema: T;

  /**
   * Apply validation steps to the request.
   *
   * The return value will be passed on to the handle function.
   *
   * @param body Request body payload matching the schema
   * @param client Client data
   */
  validate: (body: z.TypeOf<T>, client: Client) => MaybePromise<U>;

  /**
   * Handle the grant request.
   *
   * @param database Database instance
   * @param data Validated request data
   * @param client Client data
   */
  handle: (database: Database, data: U, client: Client) => Promise<TokenPayload>;
};
