import * as Knex from 'knex';
import * as R from 'ramda';

const config = {
  user: process.env.CELLULOID_PG_USER,
  password: process.env.CELLULOID_PG_PASSWORD,
  host: process.env.CELLULOID_PG_HOST,
  port: parseInt(process.env.CELLULOID_PG_PORT as string, 10),
  database: process.env.CELLULOID_PG_DATABASE,
};

export const database = Knex({
  debug: process.env.NODE_ENV !== 'production' && process.env.CELLULOID_DEBUG_SQL !== undefined,
  client: 'pg',
  connection: config,
  pool: {
    max: parseInt(
      process.env.CELLULOID_PG_MAX_POOL_SIZE as string,
      10
    ),
    idleTimeoutMillis: parseInt(
      process.env.CELLULOID_PG_IDLE_TIMEOUT as string,
      10
    )
  }
});

export const filterNull = (prop: string) =>
  // tslint:disable-next-line:no-any
  (obj: any) => {
    // tslint:disable-next-line:no-any
    obj[prop] = obj[prop].filter((elem: any) => elem);
    return obj;
  };

// tslint:disable-next-line:no-any
export function getExactlyOne(rows: any[]) {
  if (rows.length === 1) {
    return Promise.resolve(rows[0]);
  } else {
    console.error(
      'Update or insert result has less or more than one row',
      rows
    );
    return Promise.reject(Error('NotExactlyOneRow'));
  }
}

const CONFLICT_ERROR = '23505';

interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
}

export function hasConflictedOn(error: DatabaseError, table: string, key: string) {
  return error.code && error.constraint && error.code === CONFLICT_ERROR
    && R.equals(error.constraint.split('_'), [table, key, 'key']);
}