import { createQueue } from "@mgcrea/prisma-queue"

type JobPayload = { email: string };
type JobResult = { status: number };

export const emailQueue = createQueue<JobPayload, JobResult>({ name: "email" }, async (job, client) => {
  const { id, payload } = job;
  console.log(`Processing job#${id} with payload=${JSON.stringify(payload)})`);
  // await someAsyncMethod();
  await job.progress(50);


  const status = 200;
  if (Math.random() > 0.5) {
    throw new Error(`Failed for some unknown reason`);
  }
  console.log(`Finished job#${id} with status=${status}`);
  return { status };
});

