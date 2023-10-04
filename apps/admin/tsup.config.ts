import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  clean: true,
  dts: false,
  entry: ["src/index.ts", "src/my-input.tsx"],
  format: ["esm"],
  target: "esnext",
  minify: isProduction,
  sourcemap: false,
});
