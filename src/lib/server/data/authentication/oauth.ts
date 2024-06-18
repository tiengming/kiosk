import type { Client, Database } from '$lib/server/database';
import { type Insertable } from 'kysely';
import { generateRandomBytes, generateRandomString } from '$lib/utilities';
import { bufferToBase64URLString } from '@simplewebauthn/browser';
import { OAUTH_DEVICE_CODE_TTL } from '$env/static/private';

// region Authorization Codes
export function storeAuthorizationCode(
  database: Client,
  data: Insertable<Database['authentication.authorization_code']>,
) {
  return database
    .insertInto('authentication.authorization_code')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export function createAuthorizationCode(
  database: Client,
  userId: string,
  clientId: string,
  redirectUri: string,
  scopes: string[],
  challenge: string,
  ttl: number,
) {
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + ttl);
  const code = generateRandomBytes(32);

  return storeAuthorizationCode(database, {
    redirect_uri: redirectUri,
    expires_at: expiration,
    client_id: clientId,
    user_id: userId,
    challenge,
    scopes,
    code,
  });
}

export async function loadAuthorizationCode(database: Client, code: string) {
  return database
    .updateTable('authentication.authorization_code')
    .set({ used_at: new Date() })
    .returningAll()
    .where('code', '=', code)
    .where('used_at', 'is', null)
    .executeTakeFirstOrThrow();
}

// endregion

// region Authorization Requests
export function storeAuthorizationRequest(
  database: Client,
  data: Insertable<Database['authentication.authorization_request']>,
) {
  return database
    .insertInto('authentication.authorization_request')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export function loadAuthorizationRequest(database: Client, identifier: string) {
  return database
    .updateTable('authentication.authorization_request')
    .set({ used_at: new Date() })
    .returningAll()
    .where('identifier', '=', identifier)
    .where('expires_at', '>', new Date())
    .where('used_at', 'is', null)
    .executeTakeFirstOrThrow();
}

// endregion

// region Clients
export async function createClient(
  database: Client,
  data: Insertable<Database['authentication.client']>,
  scopes?: string[],
) {
  return database.transaction().execute(async (trx) => {
    const client = await trx
      .insertInto('authentication.client')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    if (scopes && scopes.length > 0) {
      await trx
        .insertInto('authentication.client_scope')
        .values(
          scopes.map((scope) => ({
            scope_id: scope,
            client_id: client.id,
          })),
        )
        .execute();
    }

    return { ...client, scopes };
  });
}

export function loadClient(database: Client, id: string) {
  return (
    database
      .selectFrom('authentication.client')
      .selectAll('authentication.client')
      .where('authentication.client.id', '=', id)
      .leftJoin(
        'authentication.client_scope',
        'authentication.client_scope.client_id',
        'authentication.client.id',
      )
      .leftJoin(
        'authentication.scope',
        'authentication.client_scope.scope_id',
        'authentication.scope.id',
      )
      // @ts-expect-error -- jsonAgg type inference is broken
      .select(({ fn }) => fn.jsonAgg('scope.id').$castTo<string[]>().as('scopes'))
      .groupBy('authentication.client.id')
      .executeTakeFirstOrThrow()
  );
}

export function loadClientWithScopes(database: Client, id: string) {
  return database
    .selectFrom('authentication.client')
    .selectAll('authentication.client')
    .where('authentication.client.id', '=', id)
    .leftJoin(
      'authentication.client_scope',
      'authentication.client_scope.client_id',
      'authentication.client.id',
    )
    .leftJoin(
      'authentication.scope',
      'authentication.client_scope.scope_id',
      'authentication.scope.id',
    )
      // @ts-expect-error -- jsonAgg type inference is broken
    .select(({ fn }) => fn.jsonAgg('scope').$castTo<Database['authentication.scope'][]>().as('scopes'))
    .groupBy('authentication.client.id')
    .executeTakeFirstOrThrow();
}

export function loadUserConsent(database: Client, clientId: string, userId: string) {
  return database
    .selectFrom('authentication.user_consent')
    .where('authentication.user_consent.client_id', '=', clientId)
    .where('authentication.user_consent.user_id', '=', userId)
    .where('authentication.user_consent.revoked_at', 'is', null)
    .where('authentication.user_consent.expires_at', 'is', null)
    .where('authentication.user_consent.granted_at', 'is not', null)
    .selectAll()
    .executeTakeFirst();
}

export function storeUserConsent(
  database: Client,
  data: Insertable<Database['authentication.user_consent']>,
) {
  return database
    .insertInto('authentication.user_consent')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export function grantUserConsent(
  database: Client,
  clientId: string,
  userId: string,
  scopes: string[],
  ttl: number,
) {
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + ttl);

  return storeUserConsent(database, {
    client_id: clientId,
    user_id: userId,
    scopes,
    granted_at: new Date(),
    expires_at: expiration,
  });
}

// endregion

// region Access Tokens
export function storeAccessToken(
  database: Client,
  data: Insertable<Database['authentication.access_token']>,
) {
  return database
    .insertInto('authentication.access_token')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export function createAccessToken(
  database: Client,
  clientId: string,
  userId: string | null,
  scopes: string[],
  ttl: number,
) {
  const token = bufferToBase64URLString(crypto.getRandomValues(new Uint8Array(24)));
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + ttl);

  return storeAccessToken(database, {
    expires_at: expiration,
    client_id: clientId,
    user_id: userId,
    scopes,
    token,
  });
}

export function loadAccessToken(database: Client, token: string) {
  return database
    .selectFrom('authentication.access_token')
    .selectAll()
    .where('token', '=', token)
    .executeTakeFirstOrThrow();
}

// endregion

// region Refresh Tokens
export function storeRefreshToken(
  database: Client,
  data: Insertable<Database['authentication.refresh_token']>,
) {
  return database
    .insertInto('authentication.refresh_token')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export function createRefreshToken(
  database: Client,
  clientId: string,
  userId: string | null,
  scopes: string[],
  ttl: number,
) {
  const token = bufferToBase64URLString(crypto.getRandomValues(new Uint8Array(24)));
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + ttl);

  return storeRefreshToken(database, {
    expires_at: expiration,
    client_id: clientId,
    user_id: userId,
    scopes,
    token,
  });
}

export function loadRefreshToken(database: Client, token: string) {
  return database
    .selectFrom('authentication.refresh_token')
    .selectAll()
    .where('token', '=', token)
    .executeTakeFirstOrThrow();
}

// endregion

// region Token Revocation
export async function revokeAccessTokenOrRefreshToken(
  database: Client,
  clientId: string,
  token: string,
) {
  const { numUpdatedRows } = await revokeRefreshToken(database, clientId, token);

  if (Number(numUpdatedRows) === 0) {
    return revokeAccessToken(database, clientId, token);
  }
}

export function revokeAccessToken(database: Client, clientId: string, token: string) {
  return database
    .updateTable('authentication.access_token')
    .set('revoked_at', new Date())
    .where('token', '=', token)
    .where('client_id', '=', clientId)
    .where('revoked_at', 'is', null)
    .where('expires_at', '>', new Date())
    .executeTakeFirst();
}

export function revokeRefreshToken(database: Client, clientId: string, token: string) {
  return database
    .updateTable('authentication.refresh_token')
    .set('revoked_at', new Date())
    .where('token', '=', token)
    .where('client_id', '=', clientId)
    .where('revoked_at', 'is', null)
    .where('expires_at', '>', new Date())
    .executeTakeFirst();
}

// endregion

// region Scopes
export function loadScopes(database: Client, scopes: string[]) {
  return database
    .selectFrom('authentication.scope')
    .selectAll()
    .where('id', 'in', scopes)
    .execute();
}

export function listAllScopes(database: Client) {
  return database.selectFrom('authentication.scope').selectAll().execute();
}

export const scopeValidationRegex = /^[a-zA-Z][a-zA-Z0-9:-]*[a-zA-Z0-9]$/;
// endregion

// region Device Grant Challenges
export function storeDeviceChallenge(
  database: Client,
  data: Insertable<Database['authentication.device_challenge']>,
) {
  return database
    .insertInto('authentication.device_challenge')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export function createDeviceChallenge(database: Client, clientId: string, scopes?: string[]) {
  const expiresAt = new Date(new Date().getTime() + Number(OAUTH_DEVICE_CODE_TTL ?? 1800) * 1000);
  const deviceCode = bufferToBase64URLString(crypto.getRandomValues(new Uint8Array(24)));

  // Generate a random string without using vowels, to avoid casual cussing
  const userCode = generateRandomString(6, 'bcdfghjklmnpqrstvwxz');

  return storeDeviceChallenge(database, {
    client_id: clientId,
    device_code: deviceCode,
    expires_at: expiresAt,
    user_code: userCode,
    scopes: scopes ?? null,
  });
}

export function loadDeviceChallenge(database: Client, clientId: string, deviceCode: string) {
  return database
    .selectFrom('authentication.device_challenge')
    .selectAll()
    .where('client_id', '=', clientId)
    .where('device_code', '=', deviceCode)
    .executeTakeFirstOrThrow();
}

export function loadDeviceChallengeByUserCode(database: Client, userCode: string) {
  return database
    .selectFrom('authentication.device_challenge')
    .selectAll()
    .where('user_code', '=', userCode)
    .where('used_at', 'is', null)
    .where('approved', 'is', null)
    .where('expires_at', '>', new Date())
    .executeTakeFirstOrThrow();
}

export function pollDeviceChallenge(database: Client, clientId: string, deviceCode: string) {
  return database
    .updateTable('authentication.device_challenge')
    .set('last_poll_at', new Date())
    .from('authentication.device_challenge as c')
    .where('authentication.device_challenge.client_id', '=', clientId)
    .where('authentication.device_challenge.device_code', '=', deviceCode)
    .where('authentication.device_challenge.used_at', 'is', null)
    .whereRef('authentication.device_challenge.id', '=', 'c.id')
    .returning([
      'authentication.device_challenge.id',
      'authentication.device_challenge.client_id',
      'authentication.device_challenge.device_code',
      'authentication.device_challenge.user_code',
      'authentication.device_challenge.expires_at',
      'authentication.device_challenge.created_at',
      'authentication.device_challenge.used_at',
      'authentication.device_challenge.scopes',
      'authentication.device_challenge.approved',
      'c.last_poll_at as last_poll_at',
    ])
    .executeTakeFirstOrThrow();
}

export function invalidateDeviceChallenge(database: Client, id: string, approved: boolean) {
  return database
    .updateTable('authentication.device_challenge')
    .set({ approved })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export function markDeviceChallengeUsed(database: Client, id: string) {
  return database
    .updateTable('authentication.device_challenge')
    .set({ used_at: new Date() })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

// endregion
