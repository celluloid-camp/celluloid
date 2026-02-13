import { defineConfig } from "orval";
import { env } from "./env";
export default defineConfig({
  visionZod: {
    input: {
      target: `${env.VISION_API_URL}/openapi.json`,
    },
    output: {
      mode: "single",
      client: "zod",
      target: "api/schema.zod.ts",
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
      target: "api/endpoints.ts",
      schemas: "api/models",
      baseUrl: env.VISION_API_URL,
      headers: true,
      biome: true,
    },
  },
});
