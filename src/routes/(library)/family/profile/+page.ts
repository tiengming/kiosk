import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
  const pageData = await event.parent();
  const user = event.data.user;
  const authenticators = await trpc(event).users.authenticatorsForCurrent.query();

  return {
    ...event.data,
    ...pageData,
    user,
    authenticators
  };
};
