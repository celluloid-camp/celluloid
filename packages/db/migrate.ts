import "dotenv/config";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { db } from "./index";

(async () => {
  try {
    console.log("Connecting to database...");
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    console.log("Database connected successfully");

    const migrationsFolder = resolve(__dirname, "./migrations");
    console.log(`Running migrations from: ${migrationsFolder}`);
    
    await migrate(db, { migrationsFolder });
    
    console.log("Migrations completed successfully");
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
})();
