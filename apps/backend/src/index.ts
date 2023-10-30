import { createSession, passport } from '@celluloid/passport';
import { prisma } from '@celluloid/prisma';
import { appRouter, createRPCContext } from '@celluloid/trpc';
import { createTerminus } from '@godaddy/terminus';
import * as trpcExpress from '@trpc/server/adapters/express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { createOpenApiExpressMiddleware } from 'trpc-openapi';

import { openApiDocument } from './openapi';

const trpcApiEndpoint = '/trpc'

async function main() {
  // express implementation
  const app = express();
  app.enable('trust proxy');

  // parse cookies
  app.use(cookieParser());

  // Setup CORS
  app.use(cors({
    origin: process.env.NODE_ENV != "production" ? ['http://localhost:3000', 'http://localhost:4000'] : undefined,
    credentials: true,
  }));

  app.disable('x-powered-by');

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(createSession());
  app.use(passport.authenticate("session"));

  app.use((req, _res, next) => {
    // request logger
    console.log('⬅️ ', req.method, req.path, req.body ?? req.query);
    next();
  });

  app.use(
    trpcApiEndpoint,
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: createRPCContext,
    }),
  );
  // Handle incoming OpenAPI requests
  app.use('/api', createOpenApiExpressMiddleware({ router: appRouter, createContext: createRPCContext }));

  // Serve Swagger UI with our OpenAPI schema
  app.use('/', swaggerUi.serve);
  app.get('/', swaggerUi.setup(openApiDocument));

  const server = app.listen(process.env.PORT || 2021, () => {
    console.log('listening on port 2021');
  });

  async function onSignal() {
    console.log('server is starting cleanup')
    await prisma.$disconnect()
    return;
  }

  createTerminus(server, {
    // signal: 'SIGINT',
    // healthChecks: { '/healthcheck': onHealthCheck },
    signals: ['SIGTERM', 'SIGINT'],
    onSignal
  })
}

void main();

