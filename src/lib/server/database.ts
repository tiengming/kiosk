import type { DB } from '../../database';
import { Kysely, PostgresDialect, sql } from 'kysely';
import pg from 'pg';
import { log } from '$lib/logging';
import { jsonBuildObject } from 'kysely/helpers/postgres';

const { Pool } = pg;

export function createClient(connectionString: URL|string, certificate: string, debug = false) {
  const dialect = new PostgresDialect({
    pool: new Pool({
      application_name: 'Kiosk',
      ssl: {
        rejectUnauthorized: false,
        ca: Buffer.from(certificate, 'base64')
      },
      connectionString: connectionString.toString(),
      log: debug
        ? (message, error, ...args) =>
            error instanceof Error
              ? log('postgres', 'error', error, ...args)
              : log('postgres', 'debug', message, ...args)
        : undefined
    })
  });

  return new Kysely<DB>({
    log: (event) => {
      const { level } = event;

      if (debug && level === 'query') {
        const {
          query: { sql, parameters },
          queryDurationMillis
        } = event;
        const query = sql.replaceAll(/\$\d+/g, (match) =>
          JSON.stringify(parameters[parseInt(match.slice(1)) - 1])
        );
        const duration = queryDurationMillis.toLocaleString(undefined, {
          maximumFractionDigits: 2
        });

        log('kysely:query', 'debug', `${query} \x1b[2m(${duration}ms)\x1b[0m`);

        return;
      }

      if (level === 'error') {
        const { error, queryDurationMillis, query } = event;

        log('kysely', 'error', `${error}${error instanceof Error ? '\n' + error.stack : ''}`, {
          query,
          duration: queryDurationMillis
        });
      }
    },
    dialect
  });
}

export function paginate<T extends keyof DB>(
  database: Client,
  table: T,
  page: number = 1,
  perPage = 10
) {
  const limit = Math.max(1, Math.min(100, perPage));
  const offset = limit * Math.max(0, page - 1);

  return (
    database
      .with('_pagination', (eb) =>
        eb.selectFrom(table).select(({ fn, lit, cast }) =>
          jsonBuildObject({
            last_page: sql<number>`ceil(count(*) / ${cast(lit(limit), 'float4')})`,
            per_page: lit(limit),
            page: lit(page),
            total: fn.countAll(),
          }).as('_pagination')
        )
      )
      .selectFrom([table, '_pagination'])

      // @ts-expect-error -- Kysely won't pick up the correct type for the CTE here - why?
      .select('_pagination')
      .limit(limit)
      .offset(offset)
  );
}

export type Client = ReturnType<typeof createClient>;

export type Database = DB;
