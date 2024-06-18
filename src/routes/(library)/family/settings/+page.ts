import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';
import { extractPaginationParametersFromUrl } from '$lib/trpc/client';

export const load = function load(event) {
  const options = extractPaginationParametersFromUrl(event.url);
  const catalogs = trpc(event).catalogs.list.query(options);

  return { catalogs };
} satisfies PageLoad;
