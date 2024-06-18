import type { LayoutServerLoad } from './$types';
import { ensureLoggedIn } from '$lib/server/utilities';

export const load = async function load({ cookies, parent, url }) {
  await ensureLoggedIn(cookies, url, parent());
} satisfies LayoutServerLoad;
