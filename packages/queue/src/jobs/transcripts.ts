import { type PrismaClient, prisma } from "@celluloid/prisma";
import { getPeerTubeCaptions } from "@celluloid/utils";
import logger from "@celluloid/utils/logger";
import { createQueue } from "@mgcrea/prisma-queue";
import { convertCaptionsToTranscript } from "../utils/llm";

type TranscriptJobPayload = { projectId: string };
type JobResult = { status: number };

const log = logger.child({ job: "transcripts" });

export const transcriptsQueue = createQueue<TranscriptJobPayload, JobResult>(
  { name: "transcripts", prisma: prisma as unknown as PrismaClient },
  async (job, prisma) => {
    const { id, payload } = job;
    log.debug(
      `Transcript queue processing job#${id} with payload=${JSON.stringify(payload)})`,
    );

    const project = await prisma.project.findUnique({
      where: { id: payload.projectId },
      select: {
        id: true,
        videoId: true,
        host: true,
      },
    });

    if (!project || !project.videoId || !project.host) {
      throw new Error("Project not found");
    }

    await job.progress(10);

    const captions = await getPeerTubeCaptions({
      videoId: project.videoId,
      host: project.host,
    });
    const frenchCaption = captions.find((caption) => caption.language === "fr");
    if (frenchCaption) {
      log.debug("caption found");
      try {
        const transcript = await convertCaptionsToTranscript(frenchCaption);

        log.debug("transcript done");
        await prisma.projectTranscript.upsert({
          where: { projectId: project.id },
          update: { content: transcript },
          create: {
            projectId: project.id,
            content: transcript,
            language: frenchCaption.language,
            entries: frenchCaption.entries,
          },
        });

        await job.progress(100);

        log.debug("transcript saved");
      } catch (error) {
        log.debug(error);
        log.error("error generating transcript");
      }
    }

    const status = 200;

    log.debug(`Finished job#${id} with status=${status}`);
    return { status };
  },
);
