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
    host: "localhost",
    proxy: {
      "/api": "http://localhost:3001",
      "/trpc": "http://localhost:2021",
    },
  },
  logLevel: "error"
});
