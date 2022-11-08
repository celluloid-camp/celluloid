import * as dotEnv from 'dotenv';
import { Knex } from 'knex';
import path from 'path';

dotEnv.config({ path: '../../.env'});

console.log(path.resolve(__dirname, "seeds"))

const configuration = {
  client: "pg",
  connection: {
    database: process.env.CELLULOID_PG_DATABASE,
    user: process.env.CELLULOID_PG_USER,
    password: process.env.CELLULOID_PG_PASSWORD
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: "knex_migrations",
    extension: 'ts',
    directory: path.resolve(__dirname, "migrations"),
    loadExtensions: [".js"]
  },
  seeds: {
    directory: path.resolve(__dirname, "seeds"),
    loadExtensions: [".js"]
  }
} as Knex.Config

export default configuration;