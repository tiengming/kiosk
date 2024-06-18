import { paginatable, paginatedResults, procedure, t } from '$lib/trpc/t';
import { loadContributionsForCreator, loadCreator, loadCreators } from '$lib/server/data/creator';
import { z } from 'zod';

export const creators = t.router({
  list: procedure()
    .input(paginatable({}))
    .query(async ({ input: { page, perPage }, ctx: { database } }) =>
      paginatedResults(loadCreators(database, page, perPage)),
    ),

  load: procedure()
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx: { database } }) => loadCreator(database, id)),

  loadContributions: procedure()
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx: { database } }) =>
      loadContributionsForCreator(database, id),
    ),
});
