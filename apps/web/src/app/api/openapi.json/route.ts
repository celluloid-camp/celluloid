import { appRouter } from "@celluloid/trpc";
import { generateOpenApiDocument } from "trpc-to-openapi";

// Generate OpenAPI schema document
const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Celluloid API",
  description: "API for the Celluloid app",
  version: "1.0.0",
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api"
      : "https://celluloid.me/api",
  docsUrl: "https://github.com/celluloid-camp/celluloid",
  tags: [
    "auth",
    "users",
    "projects",
    "playlists",
    "annotations",
    "chapters",
    "comments",
    "storage",
  ],
  securitySchemes: {
    cookieAuth: {
      type: "http",
      in: "cookie",
      name: "celluloid_session",
    },
  },
});

export const GET = () => {
  return Response.json(openApiDocument);
};
