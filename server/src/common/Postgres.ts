import * as dotenv from 'dotenv';
const knex = require('knex');

dotenv.config();

const config = {
  user: process.env.CELLULOID_PG_USER,
  password: process.env.CELLULOID_PG_PASSWORD,
  host: process.env.CELLULOID_PG_HOST,
  port: parseInt(process.env.CELLULOID_PG_PORT),
  database: process.env.CELLULOID_PG_DATABASE,
};

const builder = knex({
  client: 'pg',
  connection: config,
  pool: {
    max: parseInt(process.env.CELLULOID_PG_MAX_POOL_SIZE),
    idleTimeoutMillis: parseInt(process.env.CELLULOID_PG_IDLE_TIMEOUT)
  }
});

export default builder;
