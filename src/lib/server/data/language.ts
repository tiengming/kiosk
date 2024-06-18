import type { Client } from '$lib/server/database';

export function loadLanguages(database: Client) {
  return database.selectFrom('language').execute();
}

export function searchLanguages(database: Client, query: string) {
  return database
    .selectFrom('language')
    .select(['iso_639_3', 'name', 'type'])
    .where((eb) =>
      eb.or([
        eb('name', 'ilike', `${query}%`),
        eb('iso_639_3', 'ilike', `${query}%`),
        eb('iso_639_1', 'ilike', `${query}%`)
      ])
    )
    .limit(10)
    .execute();
}
