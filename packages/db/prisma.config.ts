import { defineConfig } from "prisma/config";
import { keys } from "./keys";
import "dotenv/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
    seed: "./prisma/seed.ts",
  },
  datasource: {
    url: keys().DATABASE_URL,
  },
});
