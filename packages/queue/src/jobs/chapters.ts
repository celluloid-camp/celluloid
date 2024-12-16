import { getPeerTubeVideoData } from "@celluloid/utils";
import { createQueue } from "@mgcrea/prisma-queue";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import os from "node:os";
import { exec } from "node:child_process";
import { detectScenes } from "../utils/scenes";
import { env } from "../env";
import type { PeerTubeVideo } from "@celluloid/types";

const execPromise = promisify(exec);
const streamPipeline = promisify(pipeline);

type ChapterJobPayload = { projectId: string };
type JobResult = { status: number };

// https://github.com/marcofaggian/lyricarr/blob/master/services/backend/src/util/queueWrapper.ts
export const chaptersQueue = createQueue<ChapterJobPayload, JobResult>(
  { name: "chapters" },
  async (job, prisma) => {
    const { id, payload } = job;
    console.log(
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
      console.error("No video file found");
      return { status: 404 };
    }


    await job.progress(10);
    // const videoPath = await downloadVideoFile(videoUrl);
    // await job.progress(50);

    await prisma.project.update({
      where: { id: payload.projectId },
      data: {
        chapterJobId: job.id,
      },
    });

    try {
      const chapters = await detectScenes({ projectId: payload.projectId, videoUrl, duration });

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
      console.error("Error detecting scenes", error);
    }

    const status = 200;

    console.log(`Finished job#${id} with status=${status}`);
    return { status };
  },
);

/**
 * Downloads a video file from a PeerTube video URL.
 * @param videoUrl - The direct URL of the video file.
 * @param outputPath - The path to save the downloaded video.
 */
async function downloadVideoFile(videoUrl: string): Promise<string> {
  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download video, status code: ${response.status}`,
    );
  }
  const outputPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);
  const fileStream = fs.createWriteStream(outputPath);
  await streamPipeline(
    response.body as unknown as NodeJS.ReadableStream,
    fileStream,
  );
  console.log("Video downloaded successfully.");
  return outputPath;
}
