import "dotenv/config"; // make sure to install dotenv package
import { resolve } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: resolve(__dirname, "../../apps/web", ".env") });

export default defineConfig({
  dialect: "postgresql",
  out: "./migrations",
  schema: "./schema/index.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});

// INSERT INTO drizzle.__drizzle_migrations(
// 	id, hash, created_at)
// 	VALUES (0, "db257c25f4193b7a020e26c0dbe1e20e8953769d06fb27297c37785f1622829a", 1771843579732);
