import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { checkAuthorization } from '$lib/server/auth/oauth/utilities';

export const POST = async function handle({ request, locals: { database } }) {
  const token = await checkAuthorization(database, request);

  return json({ token });
} satisfies RequestHandler;
