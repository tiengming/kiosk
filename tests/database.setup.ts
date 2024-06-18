import { test as setup } from 'playwright/test';
import { createClient } from '$lib/server/database';
import { storageState } from '../playwright.config';
import { createHash } from 'node:crypto';

setup('Seed the database', async ({ context }) => {
  const database = createClient(process.env.DATABASE_URL!, process.env.DATABASE_CERTIFICATE!, true);

  await database.transaction().execute(async (trx) => {
    const user = await trx
      .insertInto('authentication.user')
      .values({
        id: '999',
        name: 'Test User',
        email: 'test@kiosk.io',
        role: 'admin',
      })
      .onConflict((conflict) => conflict.column('id').doUpdateSet({ updated_at: new Date() }))
      .returningAll()
      .executeTakeFirstOrThrow();

    const client = await trx
      .insertInto('authentication.client')
      .values({
        id: 'test-client',
        name: 'Test Client',
        description: 'A test client',
        redirect_uris: ['http://localhost:3000/oauth/callback'],
        secret: null,
        active: true,
        personal: false,
        revoked: false,
        user_id: user.id,
      })
      .onConflict((conflict) => conflict.column('id').doUpdateSet({ updated_at: new Date() }))
      .returningAll()
      .executeTakeFirstOrThrow();

    await trx
      .insertInto('authentication.client_scope')
      .values([
        {
          scope_id: 'profile',
          client_id: client.id,
        },
        { scope_id: 'ingest', client_id: client.id },
      ])
      .onConflict((conflict) => conflict.doNothing())
      .execute();

    const client2 = await trx
      .insertInto('authentication.client')
      .values({
        id: 'test-client-confidential',
        name: 'Confidential Test Client',
        description: 'A confidential test client',
        redirect_uris: null,
        secret: createHash('sha256').update('foo').digest('base64url'),
        active: true,
        personal: false,
        revoked: false,
        user_id: user.id,
      })
      .onConflict((conflict) => conflict.column('id').doUpdateSet({ updated_at: new Date() }))
      .returningAll()
      .executeTakeFirstOrThrow();

    await trx
      .insertInto('authentication.client_scope')
      .values([{ scope_id: 'ingest', client_id: client2.id }])
      .onConflict((conflict) => conflict.doNothing())
      .execute();
  });

  await context.storageState({ path: storageState });
});
