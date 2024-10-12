import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { ViteAliases } from "vite-aliases";

export default defineConfig(async () => {
  return {
    plugins: [
      react(),
      ViteAliases({
        prefix: "~",
        adjustDuplicates: true,
      }),
    ],
  }
});
