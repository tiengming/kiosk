import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET = function handle({ url }) {
  throw redirect(302, new URL('/.well-known/oauth-authorization-server', url));
} satisfies RequestHandler;
