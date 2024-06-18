import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load = async function load(event) {
  const id = event.params.creator;
  const router=trpc(event);
  const creator = await router.creators.load.query({ id });
  const contributions = router.creators.loadContributions.query({ id });

  return { creator, contributions };
} satisfies PageLoad;
