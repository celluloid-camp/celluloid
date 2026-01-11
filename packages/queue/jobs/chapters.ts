import { type PrismaClient, prisma } from "@celluloid/db";
import type { PeerTubeVideo } from "@celluloid/types";
import logger from "@celluloid/utils/logger";
import { createQueue } from "@mgcrea/prisma-queue";
import { env } from "../env";
import { detectScenes } from "../utils/scenes";

type ChapterJobPayload = { projectId: string };
type JobResult = { status: number };

const log = logger.child({ job: "chapters" });

// https://github.com/marcofaggian/lyricarr/blob/master/services/backend/src/util/queueWrapper.ts
export const chaptersQueue = createQueue<ChapterJobPayload, JobResult>(
  { name: "chapters", prisma: prisma as unknown as PrismaClient },
  async (job, prisma) => {
    const { id, payload } = job;
    log.debug(
      `Chapter queue processing job#${id} with payload=${JSON.stringify(payload)})`,
    );

    const project = await prisma.project.findUnique({
      where: { id: payload.projectId },
      select: {
        metadata: true,
      },
    });

    const metadata = project?.metadata as unknown as PeerTubeVideo;

    if (!metadata) {
      throw new Error("No video data found");
    }

    const videoUrl = metadata.streamingPlaylists[0]?.files
      .sort((a, b) => a.size - b.size) // Sort files by size in ascending order
      .find((file) => file.fileDownloadUrl)?.fileDownloadUrl; // Find the first file with a download URL
    const duration = metadata.duration || 0;

    if (!videoUrl) {
      log.error("No video file found");
      return { status: 404 };
    }

    log.debug("Chapter queue processing -- metadata loaded", {
      videoUrl,
      duration,
      jobId: job.id,
    });

    await job.progress(10);
    // const videoPath = await downloadVideoFile(videoUrl);
    // await job.progress(50);

    // await prisma.project.update({
    //   where: { id: payload.projectId },
    //   data: {
    //     chapterJobId: job.id,
    //   },
    // });

    try {
      const chapters = await detectScenes({
        projectId: payload.projectId,
        videoUrl,
        duration,
      });

      await job.progress(70);
      const thumbnailStorages = await prisma.storage.createManyAndReturn({
        data: chapters.scenes.map((scene) => ({
          bucket: env.STORAGE_BUCKET,
          path: scene.thumbnailPath,
        })),
        skipDuplicates: true,
      });

      await prisma.chapter.createMany({
        data: chapters.scenes.map((scene, index) => ({
          projectId: payload.projectId,
          thumbnailStorageId: thumbnailStorages[index]?.id,
          startTime: scene.startTime,
          endTime: scene.endTime,
        })),
      });
    } catch (error) {
      log.error("Error detecting scenes", error);
    }

    const status = 200;

    log.debug(`Finished job#${id} with status=${status}`);
    return { status };
  },
);
