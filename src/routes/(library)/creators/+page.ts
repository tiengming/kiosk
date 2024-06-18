import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';
import { extractPaginationParametersFromUrl } from '$lib/trpc/client';

export const load = async function load(event) {
  const options = extractPaginationParametersFromUrl(event.url);
  const creators = await trpc(event).creators.list.query(options);

  return { creators };
} satisfies PageLoad;
