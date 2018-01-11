const postgres = require('pg');

import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  user: process.env.CELLULOID_PG_USER,
  password: process.env.CELLULOID_PG_PASSWORD,
  host: process.env.CELLULOID_PG_HOST,
  port: parseInt(process.env.CELLULOID_PG_PORT),
  database: process.env.CELLULOID_PG_DATABASE,
  max: parseInt(process.env.CELLULOID_PG_MAX_POOL_SIZE),
  idleTimeoutMillis: parseInt(process.env.CELLULOID_PG_IDLE_TIMEOUT)
};

const pool = new postgres.Pool(config);

pool.on('connect', () => {
  console.log("Postgres pool acquired a connection")
});

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool the
  // pool itself will emit an error event with both the error and the client which
  // emitted the original error this is a rare occurrence but can happen if there
  // is a network partition between your application and the database, the
  // database restarts, etc. and so you might want to handle it and at least log
  // it out
  console.error('Postgres idle client error', err.message, err.stack);
  console.error(config);
});

export default pool;
