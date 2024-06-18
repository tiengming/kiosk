import { type Client, type Database, paginate } from '$lib/server/database';
import type { Selectable } from 'kysely';

const table = 'creator' as const;

export function loadCreators(database: Client, page?: number, perPage?: number) {
  return paginate(database, table, page, perPage).selectAll().execute();
}

export function loadCreator(database: Client, id: string) {
  return database.selectFrom(table).where('id', '=', id).selectAll().executeTakeFirstOrThrow();
}

export function loadContributionsForCreator(database: Client, id: string) {
  return database
    .selectFrom('book')
    .innerJoin('edition', 'book.id', 'edition.book_id')
    .leftJoin('cover', 'edition.cover_id', 'cover.id')
    .innerJoin('contribution', 'edition.id', 'contribution.edition_id')
    .selectAll('edition')
    .select('contribution.essential as essential_contribution')
    .select('contribution.type as contribution_type')
    .select('cover.blurhash as cover_blurhash')
    .where('contribution.creator_id', '=', id)
    .execute();
}

type Table = Database[typeof table];
export type Creator = Selectable<Table>;
