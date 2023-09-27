import * as dotEnv from 'dotenv';
import { Knex } from 'knex';

dotEnv.config({ path: '../../.env' });


const configuration = {
  client: "pg",
  connection: {
    host: process.env.CELLULOID_PG_HOST,
    database: process.env.CELLULOID_PG_DATABASE,
    user: process.env.CELLULOID_PG_USER,
    password: process.env.CELLULOID_PG_PASSWORD
  },
  pool: {
    min: 2,
    max: 10
  }
} as Knex.Config

export default configuration;
