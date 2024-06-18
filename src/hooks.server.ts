import { hrtime } from 'node:process';
import { sequence } from '@sveltejs/kit/hooks';
import { createTRPCHandle } from 'trpc-sveltekit';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { createClient } from '$lib/server/database';
import { dev } from '$app/environment';
import { log } from '$lib/logging';
import { DATABASE_CERTIFICATE, DATABASE_URL } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

const handlers: Handle[] = [
  // region Database Connection in context
  async function handle({ event, resolve }) {
    event.locals.database = createClient(DATABASE_URL, DATABASE_CERTIFICATE, dev);

    return resolve(event);
  },
  // endregion

  // region tRPC setup
  createTRPCHandle({
    router,
    createContext,
    onError: dev
      ? ({ error, type, path }) => {
          const stack = error.stack?.split('\n').slice(1).join('\n') ?? '(no stack trace)';
          const message = `${path}: ${error.message}\n${stack}`;

          log(`trpc:${type}`, 'error', message);
        }
      : () => {},
  }),
  // endregion
];

// region Request Logger (Development only)
if (dev) {
  const logRequest: Handle = async function logRequest({ event, resolve }) {
    const start = hrtime.bigint();
    const uri = event.url.toString().replace(event.url.origin, '');
    const response = await resolve(event);
    const duration = (Number(hrtime.bigint() - start) / 1e6).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    log('http:request', 'debug', `${event.request.method} ${uri} \x1b[2m(${duration}ms)\x1b[0m`);

    return response;
  };

  handlers.unshift(logRequest);
}
// endregion

export const handle = sequence(...handlers);
