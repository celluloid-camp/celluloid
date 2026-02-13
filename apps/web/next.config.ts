import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withWorkflow } from "workflow/next";
import "./src/env.ts";

const nextConfig = {
  /* config options here */
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  // logging: {
  //   incomingRequests: true,
  //   fetches: {
  //     fullUrl: true,
  //   },
  // },
  experimental: {
    // reactCompiler: true,
    // deferredEntries: false,
  },
  serverExternalPackages: [],
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
} as NextConfig;

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "./locales/en.json",
  },
});
export default withWorkflow(withNextIntl(nextConfig));
