import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  clean: true,
  dts: false,
  entry: ["src/index.ts"],
  format: ["cjs"],
  minify: isProduction,
  sourcemap: true,
});
