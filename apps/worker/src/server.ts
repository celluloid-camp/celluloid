import { prisma } from "@celluloid/db";
import {
  chaptersQueue,
  emailQueue,
  transcriptsQueue,
  visionQueue,
  visionResultQueue,
} from "@celluloid/queue";
import { env } from "./env";

// Start queues
emailQueue.start();
chaptersQueue.start();
transcriptsQueue.start();
visionQueue.start();
visionResultQueue.start();

async function onSignal() {
  console.log("server is starting cleanup");
  emailQueue.stop();
  chaptersQueue.stop();
  transcriptsQueue.stop();
  visionQueue.stop();
  visionResultQueue.stop();
  console.log("queues stopped");
  await prisma.$disconnect();
  console.log("prisma disconnected");
  process.exit(0);
}

// Handle graceful shutdown
process.on("SIGTERM", onSignal);
process.on("SIGINT", onSignal);

const server = Bun.serve({
  port: env.WORKER_PORT,
  fetch(req: Request) {
    const url = new URL(req.url);

    // Version endpoint
    if (url.pathname === "/version" && req.method === "GET") {
      return Response.json({
        version: process.env.VERSION,
        revision: process.env.REVISION,
      });
    }

    // Health check endpoint
    if (url.pathname === "/healthcheck" && req.method === "GET") {
      return Response.json({ status: "ok" });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Worker is running on port ${env.WORKER_PORT}`);
