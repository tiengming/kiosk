import { type ZodCustomIssue, ZodError, type ZodIssue } from 'zod';
import { error, json, redirect } from '@sveltejs/kit';
import { resolveAcceptedMediaTypes } from '$lib/server/utilities';
import type { OAuthErrorCode } from '$lib/server/auth/oauth/types';
import { statusMap } from '$lib/server/auth/oauth/utilities';

export function userFacingOauthError(
  request: Request,
  title: OAuthErrorCode,
  description?: ZodError | string,
  uri?: string | URL,
) {
  const status = statusMap[title];

  for (const accepted of resolveAcceptedMediaTypes(request)) {
    if (accepted.startsWith('text/html')) {
      return error(status, {
        title,
        message: formatErrorDescription(description) ?? title,
      });
    }
  }

  return json(
    {
      error: title,
      error_description: formatErrorDescription(description),
      error_uri: uri?.toString(),
    },
    { status },
  );
}

export function oauthError(
  title: OAuthErrorCode,
  description?: ZodError | string,
  uri?: string | URL,
) {
  const status = statusMap[title];

  return json(
    {
      error: title,
      error_description: formatErrorDescription(description),
      error_uri: uri?.toString(),
    },
    { status },
  );
}

function formatErrorDescription(error: ZodError | string | undefined) {
  if (!error || typeof error === 'string') {
    return error;
  }

  return error.format()._errors.join(', ');
}

export function handleOAuthValidationErrors(issues: (ZodIssue | ZodCustomIssue)[]) {
  for (const issue of issues) {
    const { path, message } = issue;

    // Determine the OAuth error code
    const errorCode =
      'params' in issue && issue.params.oauth_error ? issue.params.oauth_error : 'invalid_request';

    // Handle specific field errors
    if (path.includes('client_id')) {
      if (errorCode === 'invalid_request' && message?.includes('missing')) {
        return oauthError('invalid_request', message);
      }

      return oauthError('invalid_client', message);
    }

    if (path.includes('client_secret')) {
      if (errorCode === 'invalid_request' && message?.includes('missing')) {
        return oauthError('invalid_request', message);
      }

      return oauthError('invalid_client', message);
    }

    if (path.includes('scope')) {
      return oauthError('invalid_scope', message);
    }
  }

  return oauthError('invalid_request', 'Invalid request');
}

export function oauthRedirect(
  uri: string | URL,
  searchParams: URLSearchParams | Record<string, string | undefined | null>,
) {
  const url = new URL(uri);

  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((key, value) => url.searchParams.append(key, value));
  } else {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) {
        url.searchParams.append(key, value);
      }
    }
  }

  return redirect(302, url);
}

export function errorRedirect(
  uri: string | URL,
  state: string | undefined,
  {
    description,
    title: error,
    uri: error_uri,
  }: {
    title: OAuthErrorCode;
    description?: string | ZodError<string> | undefined;
    uri?: string | URL | undefined;
  },
) {
  return oauthRedirect(uri, {
    state,
    error,
    error_description:
      !description || typeof description === 'string'
        ? description
        : description.format()._errors.join(', '),
    error_uri: error_uri?.toString(),
  });
}
