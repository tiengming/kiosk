import {
  type inferRouterInputs,
  type inferRouterOutputs,
  type RouterCaller
} from '@trpc/server';
import { users } from '$lib/trpc/routes/users';
import { accounts } from '$lib/trpc/routes/acounts';
import { authors } from '$lib/trpc/routes/authors';
import { books } from '$lib/trpc/routes/books';
import { collections } from '$lib/trpc/routes/collections';
import { publishers } from '$lib/trpc/routes/publishers';
import { comments } from '$lib/trpc/routes/comments';
import { languages } from '$lib/trpc/routes/languages';
import { catalogs } from '$lib/trpc/routes/catalogs';
import { t } from '$lib/trpc/t';
import { creators } from '$lib/trpc/routes/creators';

export const router = t.router({
  accounts,
  authors,
  books,
  catalogs,
  collections,
  comments,
  creators,
  languages,
  publishers,
  users
});

export const createCaller: RouterCaller<Router['_def']> = t.createCallerFactory(router);

export type Router = typeof router;
export type RouterInputs = inferRouterInputs<Router>;
export type RouterOutputs = inferRouterOutputs<Router>;
