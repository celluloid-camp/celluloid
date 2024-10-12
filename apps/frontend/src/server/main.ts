import express from "express";
import ViteExpress from "vite-express";
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter, createContext } from '@celluloid/trpc';
import type { Session } from 'express-session';
import { createSession, passport } from '@celluloid/passport';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();
import { emailQueue, chaptersQueue } from "@celluloid/queue";

import getAdminRouter from "./admin";
import { UserRole } from "@celluloid/prisma";

const trpcApiEndpoint = '/api/trpc'

declare module 'http' {
  interface IncomingMessage {
    session: Session & {
      userId?: string
    }
  }
}

const sessionParser = createSession();

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionParser);

app.enable('trust proxy');

// parse cookies
app.use(cookieParser());

// Setup CORS
app.use(cors({
  origin: process.env.NODE_ENV !== "production" ? ['http://localhost:3000', 'http://localhost:4000'] : undefined,
  credentials: true,
}));

app.use((req, res, next) => {
  //@ts-expect-error dynamic
  passport.authenticate('session', (err) => {
    if (err && err.name === "DeserializeUserError") {
      req.session.destroy(() =>
        next())
    }
  })(req, res, next);
});

// app.use((req, _res, next) => {
//   // request logger
//   console.log('⬅️ ', req.method, req.path, req.body ?? req.query);
//   next();
// });


const adminRouter = await getAdminRouter();

const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  // biome-ignore lint/correctness/noVoidTypeReturn: <explanation>
  if (req.user && (req.user as { role?: UserRole }).role === UserRole.Admin) return next();
  res.redirect("/");
};

app.use("/admin", isAuthenticated, adminRouter);


app.use(
  trpcApiEndpoint,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);
emailQueue.start();
chaptersQueue.start();

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
