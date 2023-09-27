import { prisma } from "@celluloid/database"
import { appRouter, createContext } from '@celluloid/trpc';
import * as trpcExpress from '@trpc/server/adapters/express';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import swaggerUi from 'swagger-ui-express';
import { createOpenApiExpressMiddleware } from 'trpc-openapi';

import { openApiDocument } from './openapi';
import { createSession } from './session';


const trpcApiEndpoint = '/trpc'


async function main() {
  // express implementation
  const app = express();

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


  passport.serializeUser((user: any, done) => {
    done(null, user.id)
  });

  passport.deserializeUser(async (id: string, done) => {
    const user = await prisma.user.findUnique({ where: { id } })
    if (user) {
      return done(null, user);
    } else {
      console.error(
        `Deserialize user failed: user with id` + ` ${id} does not exist`
      );
      return done(new Error("InvalidUser"));
    }
  });

  passport.use(
    new LocalStrategy(async (username: string, password: string, done) => {
      const user = await prisma.user.findUnique({ where: { username: username } })
      if (!user) {
        return done(new Error("InvalidUser"));
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(new Error("InvalidUser"));
      }
      if (!user.confirmed && user.role !== "Student") {
        return done(new Error("UserNotConfirmed"));
      }
      return done(null, user);

    }),
  );

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



  app.listen(2021, () => {
    console.log('listening on port 2021');
  });
}

void main();

