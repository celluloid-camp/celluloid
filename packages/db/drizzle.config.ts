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
