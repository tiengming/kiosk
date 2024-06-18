import type { LayoutLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load = async function load(event) {
  const catalogs = trpc(event)
    .catalogs.list.query({ perPage: 100 })
    .then(([catalogs]) => catalogs);

  return { catalogs };
} satisfies LayoutLoad;
