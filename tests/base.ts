import { test as base } from '@playwright/test';
import { type Client, createClient } from '$lib/server/database';

type DatabaseFixtures = {
  database: Client;
};

export const test = base.extend<DatabaseFixtures>({
  async database({headless}, use) {
    const database = createClient(process.env.DATABASE_URL!, process.env.DATABASE_CERTIFICATE!, true);

    await use(database);
  },
});
