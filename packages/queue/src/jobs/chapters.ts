import { getPeerTubeVideoData } from "@celluloid/utils";
import { createQueue } from "@mgcrea/prisma-queue";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import os from "node:os";
import { exec } from 'node:child_process';
import { detectScenes } from "../utils/scenes";

const execPromise = promisify(exec);
const streamPipeline = promisify(pipeline);

type JobPayload = { host: string; videoId: string };
type JobResult = { status: number };

interface Chapter {
  id: number;
  start_time: number;
  end_time: number;
  title?: string;
}

// https://github.com/marcofaggian/lyricarr/blob/master/services/backend/src/util/queueWrapper.ts
export const chaptersQueue = createQueue<JobPayload, JobResult>(
  { name: "chapters" },
  async (job, client) => {
    const { id, payload } = job;
    console.log(
      `Chapter queue processing job#${id} with payload=${JSON.stringify(payload)})`,
    );

    const video = await getPeerTubeVideoData({
      videoId: payload.videoId,
      host: payload.host,
    });

    const videoFile = video?.streamingPlaylists[0]?.files[0]?.fileDownloadUrl;

    if (!videoFile) {
      throw new Error("No video file found");
    }

    const videoPath = await downloadVideoFile(videoFile);
    await job.progress(50);

    try {
      const chapters = await detectScenes(videoPath);
      console.log("chapters", chapters.scenes);
    } catch (error) {
      console.error("Error detecting scenes", error);
    }



    const status = 200;

    console.log(`Finished job#${id} with status=${status}`);
    return { status, };
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
