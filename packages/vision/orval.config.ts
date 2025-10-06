import { defineConfig } from "orval";
export default defineConfig({
  visionZod: {
    input: {
      target: "https://vision.celluloid.me/openapi.json",
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
      target: "https://vision.celluloid.me/openapi.json",
    },
    output: {
      mode: "single",
      client: "fetch",
      target: "src/generated/endpoints.ts",
      schemas: "src/generated/models",
      baseUrl: "https://vision.celluloid.me",
      headers: true,
      biome: true,
    },
  },
});
