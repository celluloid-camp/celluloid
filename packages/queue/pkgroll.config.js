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
    "@celluloid/emails",
    "@celluloid/prisma",
    "@celluloid/types",
    "@celluloid/utils",
    "@mgcrea/prisma-queue",
    "@t3-oss/env-core",
    "minio",
    "nodemailer",
    "zod",
  ],
  tsconfig: "./tsconfig.json",
};
