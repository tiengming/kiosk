import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET = function handle({ url }) {
  return json({
    instance_url: url.origin,
    version: '1.0.0',
  });
} satisfies RequestHandler;
