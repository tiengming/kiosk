import type { LayoutLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: LayoutLoad = async function load(event) {
  const data = await event.parent();
  const collections = data.isAuthenticated ? trpc(event).collections.list.query() : [];

  return {
    ...data,
    collections,
  };
};
