import { defineConfig } from "orval";
import { env } from "./src/env";
export default defineConfig({
  visionZod: {
    input: {
      target: `${env.VISION_API_URL}/openapi.json`,
    },
    output: {
      mode: "single",
      client: "zod",
      target: "src/generated/schema.zod.ts",
      biome: true,
    },
  },
  visionFetch: {
    input: {
      target: `${env.VISION_API_URL}/openapi.json`,
    },
    output: {
      mode: "single",
      client: "fetch",
      target: "src/generated/endpoints.ts",
      schemas: "src/generated/models",
      baseUrl: env.VISION_API_URL,
      headers: true,
      biome: true,
    },
  },
});
