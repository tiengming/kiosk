import { test as teardown } from 'playwright/test';
import { createClient } from '$lib/server/database';

teardown('Remove test database entries', async () => {
  const database = createClient(process.env.DATABASE_URL!, process.env.DATABASE_CERTIFICATE!, true);

  await Promise.all([
    database.deleteFrom('authentication.user').where('id', 'in', ['999']).execute(),
    database
      .deleteFrom('authentication.client')
      .where('id', 'in', ['test-client', 'test-client-confidential'])
      .execute(),
  ]);
});
