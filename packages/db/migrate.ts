import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

async function waitForPostgres(
  connectionString: string,
  maxRetries = 10,
  delayMs = 1000,
): Promise<Client> {
  for (let i = 0; i < maxRetries; i++) {
    const client = new Client({ connectionString });
    try {
      await client.connect();
      await client.query("SELECT 1");
      return client;
    } catch (error) {
      await client.end().catch(() => {
        // Ignore errors when closing failed connection
      });
      if (i < maxRetries - 1) {
        console.log(
          `Waiting for PostgreSQL... (attempt ${i + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        throw new Error(
          `Failed to connect to PostgreSQL after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
  throw new Error("Failed to connect to PostgreSQL");
}

(async () => {
  try {
    console.log("Connecting to database...");
    const client = await waitForPostgres(process.env.DATABASE_URL || "");
    console.log("Database connected successfully");

    const currentDir = dirname(fileURLToPath(import.meta.url));
    const migrationsFolder = resolve(currentDir, "migrations");
    console.log(`Running migrations from: ${migrationsFolder}`);

    const db = drizzle(client);
    await migrate(db, { migrationsFolder });

    console.log("Migrations completed successfully");
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
})();
