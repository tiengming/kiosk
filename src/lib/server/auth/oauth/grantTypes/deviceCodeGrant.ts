import { z } from 'zod';
import { markDeviceChallengeUsed, pollDeviceChallenge } from '$lib/server/data/authentication/oauth';
import { OAUTH_DEVICE_POLLING_INTERVAL } from '$env/static/private';
import { OAuthError } from '$lib/server/auth/oauth/OAuthError';
import { createGrantType, issueTokens, offsetInSeconds } from '$lib/server/auth/oauth/utilities';
import type { DeviceChallenge, TokenPayload } from '$lib/server/auth/oauth/types';

/**
 * # OAuth 2.0 Device Authorization Grant
 *
 * The OAuth 2.0 device authorization grant is designed for Internet-connected devices that either
 * lack a browser to perform a user-agent-based authorization or are input constrained to the extent
 * that requiring the user to input text in order to authenticate during the authorization flow is
 * impractical.
 * It enables OAuth clients on such devices (like smart TVs, media consoles, digital picture frames,
 * and printers) to obtain user authorization to access protected resources by using a user agent on
 * a separate device.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc8628
 */
export const deviceCodeGrant = createGrantType({
  type: 'urn:ietf:params:oauth:grant-type:device_code',

  schema: z.object({
    grant_type: z.literal('urn:ietf:params:oauth:grant-type:device_code', {
      message: 'The grant type is invalid',
      description: 'REQUIRED. Value MUST be set to "urn:ietf:params:oauth:grant-type:device_code".',
    }),
    device_code: z.string({
      required_error: 'The device code is missing',
      invalid_type_error: 'The device code is invalid',
      description:
        'REQUIRED. The device verification code, "device_code" ' +
        'from the device authorization response, defined in Section 3.2.',
    }),
    client_id: z.string({
      required_error: 'The client ID is missing',
      invalid_type_error: 'The client ID is invalid',
      description:
        'REQUIRED if the client is not authenticating with the' +
        'authorization server as described in Section 3.2.1. of [RFC6749].' +
        'The client identifier as described in Section 2.2 of [RFC6749].',
    }),
  }),

  validate(data, _client) {
    return data;
  },

  async handle(database, { device_code }, client) {
    let deviceChallenge: DeviceChallenge;

    // Try to retrieve the device challenge; if found, the last poll timestamp will be updated in
    // the same query, and the updated challenge will be returned.
    try {
      deviceChallenge = await pollDeviceChallenge(database, client.id, device_code);
    } catch {
      throw new OAuthError('invalid_grant', 'The challenge code is invalid');
    }

    // region Handle the token response according to RFC8628, Section 3.5:
    // See https://datatracker.ietf.org/doc/html/rfc8628#section-3.5

    // The "device_code" has expired, and the device authorization session has concluded.
    // The client MAY commence a new device authorization request but SHOULD wait for user
    // interaction before restarting to avoid unnecessary polling.
    if (deviceChallenge.expires_at <= new Date()) {
      throw new OAuthError('expired_token');
    }

    // A variant of "authorization_pending", the authorization request is still pending and polling
    // should continue, but the interval MUST be increased by 5 seconds for this and all
    // subsequent requests.
    // TODO: This could benefit from a cool-down sliding window?
    if (isPollingTooFast(deviceChallenge, Number(OAUTH_DEVICE_POLLING_INTERVAL ?? 5))) {
      throw new OAuthError('slow_down');
    }

    // The authorization request is still pending as the end user hasn't yet completed the
    // user-interaction steps (Section 3.3).
    // The client SHOULD repeat the access token request to the token endpoint (a process known
    // as polling). Before each new request, the client MUST wait at least the number of seconds
    // specified by the "interval" parameter of the device authorization response (see Section 3.2),
    // or 5 seconds if none was provided, and respect any increase in the polling interval required
    // by the "slow_down" error.
    if (deviceChallenge.approved === null) {
      throw new OAuthError('authorization_pending');
    }

    // The authorization request was denied.
    if (!deviceChallenge.approved) {
      throw new OAuthError('access_denied', 'The resource owner denied the request');
    }

    const scopes = (deviceChallenge.scopes ?? client.scopes).filter(
      (scope): scope is string => scope !== null,
    );

    const {
      accessToken,
      refreshToken,
      expiresAt,
      scopes: effectiveScopes,
    } = await issueTokens(database, client.id, null, scopes, async (trx) => {
      await markDeviceChallengeUsed(trx, deviceChallenge.id);
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: offsetInSeconds(expiresAt),
      scope: effectiveScopes.join(' '),
      token_type: 'Bearer',
    } satisfies TokenPayload;
  },
});

function isPollingTooFast(deviceChallenge: DeviceChallenge, interval: number) {
  if (deviceChallenge.last_poll_at === null) {
    return false;
  }

  return (new Date().getTime() - deviceChallenge.last_poll_at.getTime()) / 1000 < interval;
}
