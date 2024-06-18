import type { Client } from '$lib/server/database';
import type { User } from '$lib/server/data/authentication/user';
import { generateRandomPassCode } from '$lib/server/auth/utilities';
import { PUBLIC_PASSCODE_LENGTH, PUBLIC_PASSCODE_TTL } from '$env/static/public';

const table = 'authentication.passcode' as const;

export async function verifyPasscode(client: Client, email: string, code: string) {
  const result = await client
    .deleteFrom(table)
    .where(expression => expression
      .and({ email, code })
      .and('expires_at', '>', new Date())
    )
    .using('authentication.user')
    .returning('user_id')
    .executeTakeFirstOrThrow();

  return Number(result.user_id);
}

export function createPasscode(client: Client, user: User | User['id']) {
  const code = generateRandomPassCode(Number(PUBLIC_PASSCODE_LENGTH || 6));
  const ttl = Number(PUBLIC_PASSCODE_TTL || 300) * 1_000;

  return client
    .insertInto(table)
    .values({
      user_id: typeof user === 'string' ? user : user.id,
      expires_at: new Date(Date.now() + ttl),
      code
    })
    .onConflict(conflict => conflict
      .column('user_id')
      .doUpdateSet({
        expires_at: new Date(Date.now() + ttl),
        code
      })
    )
    .returning('code')
    .executeTakeFirstOrThrow();
}
