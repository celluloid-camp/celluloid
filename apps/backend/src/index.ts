import { createSession, passport } from '@celluloid/passport';
import { prisma } from '@celluloid/prisma';
import { appRouter, createContext } from '@celluloid/trpc';
import type { AppRouter } from '@celluloid/trpc'
import { createTerminus } from '@godaddy/terminus';
import * as trpcExpress from '@trpc/server/adapters/express';
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import type { Session } from 'express-session';
import http from 'node:http'
import swaggerUi from 'swagger-ui-express';
import { createOpenApiExpressMiddleware } from 'trpc-openapi';
import { WebSocketServer } from 'ws'
import { emailQueue } from "@celluloid/queue";

import { openApiDocument } from './openapi';
const trpcApiEndpoint = '/trpc'


declare module 'http' {
  interface IncomingMessage {
    session: Session & {
      userId?: string
    }
  }
}

async function main() {
  // express implementation
  const app = express();

  const sessionParser = createSession();
  app.enable('trust proxy');

  // parse cookies
  app.use(cookieParser());

  // Setup CORS
  app.use(cors({
    origin: process.env.NODE_ENV !== "production" ? ['http://localhost:3000', 'http://localhost:4000'] : undefined,
    credentials: true,
  }));

  app.disable('x-powered-by');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(sessionParser);

  app.use((req, res, next) => {
    passport.authenticate('session', (err) => {
      if (err && err.name === "DeserializeUserError") {
        req.session.destroy(() =>
          next())
      }
    })(req, res, next);
  });

  // app.use(passport.authenticate("session"));

  app.use((req, _res, next) => {
    // request logger
    console.log('⬅️ ', req.method, req.path, req.body ?? req.query);
    next();
  });
  app.use(
    trpcApiEndpoint,
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // Handle incoming OpenAPI requests
  app.use('/api', createOpenApiExpressMiddleware({ router: appRouter, createContext }));

  // Serve Swagger UI with our OpenAPI schema
  app.use('/', swaggerUi.serve);
  app.get('/', swaggerUi.setup(openApiDocument));


  const server = http.createServer(app)

  // web socket server
  const wss = new WebSocketServer({ clientTracking: false, noServer: true, path: trpcApiEndpoint })

  function onSocketError(err: Error) {
    console.error(err);
  }

  server.on('upgrade', (request, socket, head) => {
    socket.on('error', onSocketError);
    sessionParser(request, {}, () => {
      // only allow ws connection with authenticated session
      if (!request.session) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      socket.removeListener('error', onSocketError);
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });
  });


  const wsHandler = applyWSSHandler<AppRouter>({
    wss,
    router: appRouter,
    createContext,
  })

  server.listen(process.env.PORT || 2021, () => {
    console.log(`listening on port 2021 -  NODE_ENV:${process.env.NODE_ENV}`);
  });



  await emailQueue.start();

  async function onSignal() {
    console.log(`server is starting cleanup`)
    wsHandler.broadcastReconnectNotification()
    await new Promise((resolve) => wss.close(resolve));
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect()
    return;
  }

  createTerminus(server, {
    // healthChecks: { '/healthcheck': onHealthCheck },
    signals: ['SIGTERM', 'SIGINT'],
    onSignal
  })

}

void main();

