/** @type {import('pkgroll').Config} */
export default {
  input: "src/index.ts",
  output: "dist",
  format: "esm",
  minify: true,
  sourcemap: true,
  typescript: true,
  external: [
    "@celluloid/config",
    "@celluloid/types",
    "@celluloid/utils",
    "@t3-oss/env-core",
    "zod",
  ],
  tsconfig: "./tsconfig.json",
};
