import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { Client } from "minio";
import { spawn } from "node:child_process";

import { parseUrl } from "./s3";
import { env } from "../env";

interface Scene {
  id: number;
  startTime: number;
  endTime: number;
  thumbnailPath: string;
}

type ScenesResult = {
  outputDir: string;
  scenes: Scene[];
};

/**
 * Detects scenes in a video based on a specified threshold and generates thumbnails for each scene.
 * @param videoUrl - Path to the video file.
 * @param threshold - Scene change threshold (default is 0.4).
 * @param outputDir - Directory to save the thumbnails.
 * @returns A promise that resolves with an array of detected scenes and their thumbnail paths.
 */
export async function detectScenes({
  projectId,
  videoUrl,
  threshold = 0.4,
  duration,
}: {
  projectId: string;
  videoUrl: string;
  threshold?: number;
  duration: number;
}): Promise<ScenesResult> {
  // Create output directory
  const currentDate = new Date().toISOString().split("T")[0];
  const outputDir = path.join(os.tmpdir(), `${projectId}/scene_detection_${currentDate}`);
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    // Replace zx command with native Node.js spawn
    const stdout = await new Promise<string>((resolve, reject) => {
      const ffmpegProcess = spawn('ffmpeg', [
        '-i', videoUrl,
        '-vf', `select='gt(scene,${threshold})',scale=320:-1,showinfo`,
        '-vsync', 'vfr',
        '-start_number', '1',
        '-frame_pts', '0',
        path.join(outputDir, 'thumbnail_%d.jpg')
      ]);

      let output = '';
      let errorOutput = '';

      ffmpegProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        // FFmpeg outputs progress to stderr, we need to parse it
        const matches = data.toString().match(/pts_time:([0-9.]+)/g);
        if (matches) {
          output += matches.map((m: string) => m.split(':')[1]).join('\n');
        }
      });

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}\n${errorOutput}`));
        }
      });

      ffmpegProcess.on('error', reject);
    });

    const timestamps = stdout.trim().split('\n').map(Number);
    const scenes: Scene[] = [];

    // Process the timestamps
    timestamps.forEach((currentTimestamp: number, index: number) => {
      const id = index + 1;
      const startTime = index === 0 ? 0 : timestamps[index - 1] ?? 0;
      const endTime = currentTimestamp;

      const thumbnailPath = path.join(
        outputDir,
        `thumbnail_${id}.jpg`,
      );

      scenes.push({
        id,
        startTime,
        endTime,
        thumbnailPath,
      });
    });

    // Update the last scene's end time to video duration
    if (scenes.length > 0) {
      const lastScene = scenes[scenes.length - 1];
      if (lastScene) {
        lastScene.endTime = duration;
      }

      // Generate thumbnails and upload to S3
      // await generateThumbnails(projectId, videoUrl, scenes, outputDir);

      const updatedScenes = await uploadThumbnailsToS3(projectId, scenes);
      // Remove the temporary directory
      fs.rmSync(outputDir, { recursive: true });

      return { outputDir, scenes: updatedScenes };
    }

    return { outputDir, scenes };

  } catch (error) {
    console.error("Error processing video:", error);
    throw error;
  }
}

async function uploadThumbnailsToS3(
  projectId: string,
  scenes: Scene[],
): Promise<Scene[]> {
  const storageUrlInfo = parseUrl(env.STORAGE_URL)

  // Initialize MinIO client
  const minioClient = new Client({
    endPoint: storageUrlInfo.host,
    port: storageUrlInfo.port,
    useSSL: storageUrlInfo.isSecure,
    accessKey: env.STORAGE_ACCESS_KEY,
    secretKey: env.STORAGE_SECRET_KEY,
  });


  // Ensure the bucket exists
  const bucketExists = await minioClient.bucketExists(env.STORAGE_BUCKET);
  if (!bucketExists) {
    throw new Error("Bucket does not exist");
  }

  for (const scene of scenes) {
    const localFilePath = scene.thumbnailPath;
    const fileName = path.basename(localFilePath);
    const s3ObjectName = `${projectId}/chapters/${fileName}`;

    await minioClient.fPutObject(env.STORAGE_BUCKET, s3ObjectName, localFilePath, {
      "Content-Type": "image/jpeg",
    });

    console.log(`Uploaded ${s3ObjectName} to ${env.STORAGE_BUCKET}`);
    // Update the thumbnailPath with the S3 URL
    scene.thumbnailPath = s3ObjectName;

    // Remove the local file after upload
    fs.unlinkSync(localFilePath);
  }

  return scenes;
}
