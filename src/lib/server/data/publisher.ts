import type { Selectable } from 'kysely';
import type { Client, Database } from '$lib/server/database';
import { withCover } from '$lib/server/data/book';

const table = 'publisher' as const;

export async function listPublishers(database: Client, term?: string) {
  const query = database.selectFrom('publisher').selectAll().orderBy('updated_at', 'desc');

  if (term) {
    return query.where('name', 'like', `%${term}%`).execute();
  }

  return query.execute();
}

export function loadPublisher(database: Client, id: string) {
  return database
    .selectFrom('publisher')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
}

export function loadBooksForPublisher(database: Client, id: string) {
  return withCover(
    database
      .selectFrom('publisher')
      .innerJoin('edition', 'edition.publisher_id', 'publisher.id')
      .innerJoin('book', 'book.id', 'edition.book_id')
      .where('publisher.id', '=', id)
  )
    .selectAll('book')
    .selectAll('edition')
    .select('book.id as id')
    .execute();
  //
  // return database
  //   .selectFrom('publisher')
  //   .innerJoin('edition', 'edition.publisher_id', 'publisher.id')
  //   .innerJoin('book', 'book.id', 'edition.book_id')
  //   .leftJoin('cover', 'cover.id', 'edition.cover_id')
  //   .where('publisher.id', '=', id)
  //   .selectAll('book')
  //   .selectAll('edition')
  //   .select(({ ref }) => ref('cover.blurhash').as('cover_blurhash'))
  //   .execute();
}

export function loadCreatorsForPublisher(database: Client, id: string) {
  return database
    .selectFrom('publisher')
    .innerJoin('edition', 'edition.publisher_id', 'publisher.id')
    .innerJoin('contribution', 'contribution.edition_id', 'edition.id')
    .innerJoin('creator', 'creator.id', 'contribution.creator_id')
    .where('publisher.id', '=', id)
    .selectAll('creator')
    .execute();
}

type Table = Database[typeof table];
export type Publisher = Selectable<Table>;
