import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load = async function load(event) {
  const query = event.url.searchParams.get('q') || undefined;
  const publishers = await trpc(event).publishers.list.query(query);

  return {
    publishers
  };
} satisfies PageLoad;
