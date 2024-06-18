import { procedure, t, unguardedProcedure } from '$lib/trpc/t';
import { z } from 'zod';
import {
  loadBook,
  loadBooks,
  loadCreators,
  loadPublisher,
  loadRatings, loadReviews,
  updateRating
} from '$lib/server/data/book';

export const books = t.router({
  list: unguardedProcedure()
    .input(
      z.object({
        query: z.string().optional()
      })
    )
    .query(({ input, ctx: { database } }) => loadBooks(database, input.query)),

  load: procedure()
    .input(z.string())
    .query(({ input, ctx: { database } }) => loadBook(database, input)),

  loadCreators: procedure()
    .input(z.object({ bookId: z.string(), editionId: z.string().optional() }))
    .query(({ input: { bookId, editionId }, ctx: { database } }) =>
      loadCreators(database, bookId, editionId)
    ),

  loadPublisher: procedure()
    .input(z.object({ bookId: z.string(), editionId: z.string().optional() }))
    .query(({ input: { bookId, editionId }, ctx: { database } }) =>
      loadPublisher(database, bookId, editionId)
    ),

  loadRatings: procedure()
    .input(z.object({ bookId: z.string() }))
    .query(async ({ input: { bookId }, ctx: { database } }) => loadRatings(database, bookId)),

  updateRating: procedure()
    .input(z.object({ bookId: z.string(), rating: z.number() }))
    .mutation(async ({ input: { bookId, rating }, ctx: { database, userId } }) =>
      updateRating(database, bookId, userId, rating)
    ),

  loadReviews: procedure()
    .input(z.object({ bookId: z.string(), editionId: z.string().optional() }))
    .query(({ input: { bookId, editionId }, ctx: { database } }) =>
      loadReviews(database, bookId, editionId)
    ),

  save: procedure()
    .input(
      z.object({
        id: z.string().nullable().optional(),
        title: z.string().optional(),
        rating: z.number({ coerce: true }).optional(),
        description: z.string().nullable().optional()
      })
    )
    .mutation(async ({ input: { id, ...rest }, ctx: { userId, url } }) => {
      if (!id) {
        throw new Error('Books must not be created via the JSON API');
      }
      //
      // const book = await prisma.book.update({
      //   data: {
      //     ...rest,
      //     updatedByUserId: userId
      //   },
      //   where: { id },
      //   include: {
      //     author: { select: { name: true } },
      //     publisher: { select: { name: true } }
      //   }
      // });

      // await indexBook(book, url);
    }),

  delete: procedure()
    .input(z.string())
    .mutation(async ({ input: id }) => {
      // await prisma.book.delete({ where: { id } });
    })
});
