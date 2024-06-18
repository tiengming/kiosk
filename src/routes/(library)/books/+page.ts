import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async function load(event) {
  const query = event.url.searchParams.get('q') || undefined;
  const books = await trpc(event).books.list.query({ query });

  return { books };
};
