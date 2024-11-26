import express from "express";
import ViteExpress from "vite-express";
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter, createContext } from '@celluloid/trpc';
import cookies from 'cookie-parser';
import cors from 'cors';

import { emailQueue, chaptersQueue } from "@celluloid/queue";

import { auth } from "@celluloid/auth";
import getAdminRouter from "./admin";

import { fromNodeHeaders, toNodeHandler } from "better-auth/node";


const app = express();
app.disable('x-powered-by');
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.enable('trust proxy');

// parse cookies
app.use(cookies());

// Setup CORS
// app.use(cors({
//   origin: process.env.NODE_ENV !== "production" ? ['http://localhost:3000', 'http://localhost:4000'] : undefined,
//   credentials: true,
// }));

app.all("/api/auth/*", toNodeHandler(auth));

// app.use((req, _res, next) => {
//   // request logger
//   console.log('⬅️ ', req.method, req.path, req.body ?? req.query);
//   next();
// });

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});


const adminRouter = await getAdminRouter();

app.use("/admin", async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session || session.user.role !== "admin") {
    res.redirect("/");
    return;
  }

  next();
}, adminRouter);


app.use(
  "/api/trpc",
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
