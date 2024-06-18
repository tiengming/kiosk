import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  const caller = createCaller(await createContext(event));

  try {
    const user = await caller.users.current();

    return { user };
  } catch (err) {
    console.error(err);
    throw error(404, 'User not found');
  }
};
