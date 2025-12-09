import { prisma } from "@celluloid/prisma";
import {
  chaptersQueue,
  emailQueue,
  transcriptsQueue,
  visionQueue,
  visionResultQueue,
} from "@celluloid/queue";
import { createTerminus } from "@godaddy/terminus";
import express from "express";
import { env } from "./env";

const app = express();
app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true }));

app.get("/version", (req, res) => {
  res.json({
    version: process.env.VERSION,
    revision: process.env.REVISION,
  });
});

emailQueue.start();
chaptersQueue.start();
transcriptsQueue.start();
visionQueue.start();
visionResultQueue.start();

const server = app.listen(env.WORKER_PORT, () =>
  console.log(`Worker is running on port ${env.WORKER_PORT} `),
);

async function onSignal() {
  console.log("server is starting cleanup");
  emailQueue.stop();
  chaptersQueue.stop();
  transcriptsQueue.stop();
  visionQueue.stop();
  visionResultQueue.stop();
  console.log("queues stopped");
  await new Promise((resolve) => server.close(resolve));
  console.log("server closed");
  await prisma.$disconnect();
  console.log("prisma disconnected");
  return;
}

createTerminus(server, {
  healthChecks: { "/healthcheck": () => Promise.resolve() },
  signals: ["SIGTERM", "SIGINT"],
  onSignal,
});
