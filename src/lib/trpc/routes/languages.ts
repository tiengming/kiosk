import { procedure, t } from '$lib/trpc/t';
import { z } from 'zod';
import { searchLanguages } from '$lib/server/data/language';

export const languages = t.router({
  autocomplete: procedure()
    .input(z.string())
    .query(({ input, ctx: { database } }) => searchLanguages(database, input))
});
