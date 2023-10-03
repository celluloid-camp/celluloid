import { appRouter } from '@celluloid/trpc';
import { generateOpenApiDocument } from 'trpc-openapi';

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Celluloid REST API',
  description: 'OpenAPI compliant REST API built using tRPC with Express',
  version: '1.0.0',
  baseUrl: 'http://localhost:2021/api',
  docsUrl: 'https://github.com/celluloid-camp/celluloid',
  tags: ['auth', 'users', 'projects'],
});
