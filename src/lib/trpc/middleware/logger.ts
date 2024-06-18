import { type Trpc } from '$lib/trpc/t';
import { log } from '$lib/logging';

export function logger(t: Trpc) {
  return t.middleware(async function logger({ path, type, next }) {
    const start = Date.now();
    const result = await next();
    const duration = Date.now() - start;

    log(`trpc:${type}`, result.ok ? 'info' : 'error', `${path} \x1b[2m(${duration}ms)\x1b[0m`);

    return result;
  });
}
