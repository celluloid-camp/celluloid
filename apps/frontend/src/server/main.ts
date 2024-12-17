import express from "express";
import ViteExpress from "vite-express";
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter, createContext } from '@celluloid/trpc';
import cookies from 'cookie-parser';
import cors from 'cors';
import "./env";

import { emailQueue, chaptersQueue } from "@celluloid/queue";

import { expressAuthHandler, expressAuthSession } from "@celluloid/auth";
import getAdminRouter from "./admin";
import { createTerminus } from '@godaddy/terminus';
import { prisma } from "@celluloid/prisma";
import { env } from "./env";


const app = express();
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));
app.enable('trust proxy');

// parse cookies
app.use(cookies());

// Setup CORS
app.use(cors({
  origin: process.env.NODE_ENV !== "production" ? ['http://localhost:3000', 'http://localhost:4000'] : undefined,
  credentials: true,
}));

app.all("/api/auth/*", expressAuthHandler);

// app.use((req, _res, next) => {
//   // request logger
//   console.log('⬅️ ', req.method, req.path, req.body ?? req.query);
//   next();
// });

app.get("/api/me", async (req, res) => {
  const session = await expressAuthSession(req)
  return res.json(session);
});

app.use(express.json());

const adminRouter = await getAdminRouter();

app.use("/admin", async (req, res, next) => {
  const session = await expressAuthSession(req)
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

ViteExpress.config({
  ignorePaths: /^\/api\/.*/,
});



const server = ViteExpress.listen(app, env.PORT, () =>
  console.log(`Server is listening on port ${env.PORT}...`),
);


async function onSignal() {
  console.log("server is starting cleanup")
  // wsHandler.broadcastReconnectNotification()
  await emailQueue.stop();
  await chaptersQueue.stop();
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect()
  return;
}

createTerminus(server, {
  // healthChecks: { '/healthcheck': onHealthCheck },
  signals: ['SIGTERM', 'SIGINT'],
  onSignal
})
