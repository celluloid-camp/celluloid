import { resolve } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// we don't use the keys file here because to not cause build errors
// import { keys } from "./keys";

config({ path: resolve(__dirname, "../../apps/web", ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
