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
      target: "generated/schema.zod.ts",
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
      target: "generated/endpoints.ts",
      schemas: "generated/models",
      baseUrl: env.VISION_API_URL,
      headers: true,
      biome: true,
    },
  },
});
