import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { ViteAliases } from "vite-aliases";

// https://vitejs.dev/config/
export default defineConfig({
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
});
