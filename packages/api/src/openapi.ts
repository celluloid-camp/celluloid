import { generateOpenApiDocument } from 'trpc-openapi';

import { appRouter } from './routers';

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Celluloid CRUD API',
  description: 'OpenAPI compliant REST API built using tRPC with Express',
  version: '1.0.0',
  baseUrl: 'http://localhost:2021/api',
  docsUrl: 'https://github.com/jlalmes/trpc-openapi',
  tags: ['auth', 'users', 'projects'],
});
