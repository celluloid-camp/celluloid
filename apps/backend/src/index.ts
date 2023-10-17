import { appRouter, createRPCContext } from '@celluloid/trpc';
import * as trpcExpress from '@trpc/server/adapters/express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { createOpenApiExpressMiddleware } from 'trpc-openapi';

import { openApiDocument } from './openapi';
import passport from "./passport";
import { createSession } from './session';

const trpcApiEndpoint = '/trpc'

async function main() {
  // express implementation
  const app = express();
  app.enable('trust proxy');

  // parse cookies
  app.use(cookieParser());

  // Setup CORS
  app.use(cors({
    // origin: 'http://localhost:3000',
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



  app.listen(process.env.PORT || 2021, () => {
    console.log('listening on port 2021');
  });
}

void main();

