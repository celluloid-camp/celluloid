import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig(async () => {
  return {
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
        "~/": path.resolve(__dirname, "./src"),
        "~components": path.resolve(__dirname, "./src/components"),
        "~hooks": path.resolve(__dirname, "./src/hooks"),
        "~images": path.resolve(__dirname, "./src/images"),
        "~services": path.resolve(__dirname, "./src/services"),
        "~theme": path.resolve(__dirname, "./src/theme"),
        "~utils": path.resolve(__dirname, "./src/utils"),
        "~pages": path.resolve(__dirname, "./src/pages"),
        "~state": path.resolve(__dirname, "./src/state"),
        "~server": path.resolve(__dirname, "./src/server"),
        "~chapters": path.resolve(__dirname, "./src/chapters"),
        "~lib": path.resolve(__dirname, "./src/lib"),
      },
    },
    plugins: [
      react()
    ],
  }
});
