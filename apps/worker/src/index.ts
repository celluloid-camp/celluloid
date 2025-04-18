import express from "express";

import { emailQueue, chaptersQueue, transcriptsQueue } from "@celluloid/queue";
import { createTerminus } from '@godaddy/terminus';
import { prisma } from "@celluloid/prisma";
import { env } from "./env";


const app = express();
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));

emailQueue.start();
chaptersQueue.start();
transcriptsQueue.start();

const server = app.listen(env.WORKER_PORT, () =>
  console.log(`Worker is running on port ${env.WORKER_PORT}`),
);


async function onSignal() {
  console.log("server is starting cleanup")
  // wsHandler.broadcastReconnectNotification()
  emailQueue.stop();
  chaptersQueue.stop();
  transcriptsQueue.stop();
  console.log("queues stopped")
  await new Promise((resolve) => server.close(resolve));
  console.log("server closed")
  await prisma.$disconnect()
  console.log("prisma disconnected")
  return;
}


createTerminus(server, {
  healthChecks: { '/healthcheck': () => Promise.resolve() },
  signals: ['SIGTERM', 'SIGINT'],
  onSignal
})
