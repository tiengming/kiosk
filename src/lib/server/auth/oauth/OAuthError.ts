import type { OAuthErrorCode } from '$lib/server/auth/oauth/types';

export class OAuthError extends Error {
  public readonly code: OAuthErrorCode;
  public readonly description: string | undefined;
  public readonly uri: URL | undefined;

  constructor(
    code: OAuthErrorCode,
    description?: string,
    uri?: string | URL,
    options?: { cause: unknown },
  ) {
    super(code, options);
    this.code = code;
    this.description = description;
    this.uri = uri ? new URL(uri) : undefined;

    Object.setPrototypeOf(this, OAuthError.prototype);
    this.name = 'OAuthError';
  }
}

export class OAuthAuthorizationError extends OAuthError {
  public readonly redirectUri: URL;
  public readonly state: string | undefined;

  constructor(
    code: OAuthErrorCode,
    redirectUri: string | URL,
    state?: string,
    description?: string,
    uri?: string | URL,
    options?: { cause: unknown },
  ) {
    super(code, description, uri, options);
    this.redirectUri = new URL(redirectUri);
    this.state = state;

    Object.setPrototypeOf(this, OAuthAuthorizationError.prototype);
    this.name = 'OAuthAuthorizationError';
  }
}
