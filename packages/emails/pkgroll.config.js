/** @type {import('pkgroll').Config} */
export default {
  input: "src/index.ts",
  output: "dist",
  format: "esm",
  minify: true,
  sourcemap: true,
  typescript: true,
  external: ["@celluloid/config", "@react-email/components", "react-email"],
  tsconfig: "./tsconfig.json",
};
