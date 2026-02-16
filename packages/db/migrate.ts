import "dotenv/config";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { db } from "./index";

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  await migrate(db, { migrationsFolder: resolve(__dirname, "./migrations") });
  await client.end();
})();
