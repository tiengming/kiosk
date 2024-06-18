import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const fallback = function handle() {
  throw redirect(303, '/auth/oauth/device');
} satisfies RequestHandler;

export const prerender = true;
