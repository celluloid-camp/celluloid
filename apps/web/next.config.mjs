// import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig = {
  /* config options here */
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    "@t3-oss/env-nextjs",
    "better-auth",
    "@t3-oss/env-core",
    "@celluloid/trpc",
    "@celluloid/prisma",
    "@celluloid/auth",
    "@celluloid/types",
    "@celluloid/utils",
  ],
};

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "./locales/en.json",
  },
});
// @ts-ignore
export default withNextIntl(nextConfig);
