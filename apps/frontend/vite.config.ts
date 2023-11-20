import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { ViteAliases } from "vite-aliases";

export default defineConfig(async ({ mode }) => {
  return {
    plugins: [
      react(),
      ViteAliases({
        prefix: "~",
        adjustDuplicates: true,
      }),
    ],

    server: {
      port: 3000,
      host: "localhost"
    },
    logLevel: "error"
  }
});
