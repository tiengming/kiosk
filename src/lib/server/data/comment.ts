import type { Selectable } from 'kysely';
import type { Client, Database } from '$lib/server/database';
import type { User } from '$lib/server/data/authentication/user';

const table = 'comment';

export function loadComment(database: Client, id: number | string) {
  return database.selectFrom(table).where('id', '=', id.toString()).executeTakeFirstOrThrow();
}

export function loadCommentsOn<T extends Commentable = Commentable>(
  database: Client,
  entity: T,
  id: number | string
) {
  const k1 = `${entity}_id` as const;

  return database
    .selectFrom(entity)
    .selectAll()
    .innerJoin(`${entity}_comment`, k1, `${entity}.id`)
    .innerJoin(table, `${entity}_comment.comment_id`, `comment.id`)
    .where(`${entity}.id`, '=', id.toString())
    .execute();
}

export function loadCommentsOnBook(database: Client, id: number | string) {
  return database
    .selectFrom('book')
    .selectAll()
    .innerJoin('book_comment', 'book_comment.book_id', 'book.id')
    .innerJoin(table, 'book_comment.comment_id', 'id')
    .where('book.id', '=', id.toString())
    .execute();
}

export type Comment = Omit<Selectable<Database[typeof table]>, 'created_at' | 'updated_at'> & {
  created_at: string | Date;
  updated_at: string | Date | null;
};
export type CommentWithUser = Omit<Comment, 'created_by'> & { created_by: User };
type Reaction = Omit<Selectable<Database['comment_reaction']>, 'comment_id' | 'created_at'> & {
  created_at: string | Date;
};
export type CommentWithReactions = Comment & {
  reactions: Reaction[];
};
export type CommentWithUserAndReactions = CommentWithUser &
  Omit<CommentWithReactions, 'created_by'>;
export type Commentable = 'book' | 'collection' | 'creator' | 'publisher' | 'series';
