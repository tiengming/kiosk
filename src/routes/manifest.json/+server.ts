import type { RequestHandler } from './$types';
import type { WebAppManifest } from 'web-app-manifest';

export const GET = async function handle({ url }) {
  const manifest = {
    name: 'Kiosk',
    short_name: 'Kiosk',
    display: 'minimal-ui',
    dir: 'ltr',
    id: new URL('/', url.origin).toString(),
    start_url: new URL('/', url.origin).toString(),
  } satisfies WebAppManifest;

  return new Response(JSON.stringify(manifest), {
    headers: {
      'content-type': 'application/manifest+json',
    },
  });
} satisfies RequestHandler;

export const prerender = true;
