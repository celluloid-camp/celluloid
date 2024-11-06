import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { Client } from "minio";
import { env } from "@celluloid/utils";
import { parseUrl } from "./s3";

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
 * @param videoPath - Path to the video file.
 * @param threshold - Scene change threshold (default is 0.4).
 * @param outputDir - Directory to save the thumbnails.
 * @returns A promise that resolves with an array of detected scenes and their thumbnail paths.
 */
export async function detectScenes({
  projectId,
  videoPath,
  threshold = 0.4,
  duration,
}: {
  projectId: string;
  videoPath: string;
  threshold?: number;
  duration: number;
}): Promise<ScenesResult> {
  return new Promise((resolve, reject) => {
    const scenes: Scene[] = [];
    let output = "";

    // Create a folder in the OS temp directory with the current date
    const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const outputDir = path.join(os.tmpdir(), `${projectId}/scene_detection_${currentDate}`);
    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`Output directory: ${outputDir}`);

    ffmpeg(videoPath)
      .videoFilters([
        `select='gt(scene,${threshold})'`,
        "scale=320:-1",
        "showinfo",
      ])
      .outputOptions(["-vsync", "0", "-f", "null"])
      .output("-")
      .on("start", (command) => {
        console.log("FFmpeg command:", command);
      })
      .on("stderr", (stderrLine) => {
        output += stderrLine;
      })
      .on("end", () => {
        // Parse the output to extract scene timestamps
        const sceneRegex = /pts_time:(\d+\.\d+)/g;
        let match: RegExpExecArray | null;
        let id = 1;
        let lastTimestamp = 0;

        // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
        while ((match = sceneRegex.exec(output)) !== null) {
          const currentTimestamp = match[1] ? Number.parseFloat(match[1]) : 0;

          if (id > 1) {
            // Update the endTime of the previous scene
            const currentScene = scenes[scenes.length - 1];
            if (currentScene) {
              currentScene.endTime = currentTimestamp;
            }
          }

          const thumbnailPath = path.join(
            outputDir,
            `thumbnail_${String(id)}.jpg`,
          );

          scenes.push({
            id,
            startTime: lastTimestamp,
            endTime: currentTimestamp, // This will be updated in the next iteration
            thumbnailPath,
          });

          lastTimestamp = currentTimestamp;
          id++;
        }

        // Set the endTime of the last scene to the video duration
        if (scenes.length > 0) {

          const lastScene = scenes[scenes.length - 1];
          if (lastScene) {
            lastScene.endTime = duration;
          }

          generateThumbnails(projectId, videoPath, scenes, outputDir)
            .then(() => resolve({ outputDir, scenes }))
            .catch(reject);

        } else {
          resolve({ outputDir, scenes });
        }
      })
      .on("error", (err) => {
        console.error("Error processing video:", err);
        reject(err);
      })
      .run();
  });
}

async function generateThumbnails(
  projectId: string,
  videoPath: string,
  scenes: Scene[],
  outputDir: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timestamps = scenes.map((scene) => scene.startTime);

    ffmpeg(videoPath)
      .screenshots({
        timestamps: timestamps,
        filename: "thumbnail_%i.jpg",
        folder: outputDir,
        size: "320x?",
      })
      .on("end", async () => {
        try {
          // Upload thumbnails to S3 and update scene paths
          await uploadThumbnailsToS3(projectId, scenes);
          // Remove the temporary directory
          fs.rmSync(outputDir, { recursive: true });
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (err) => {
        console.error("Error generating thumbnails:", err);
        reject(err);
      });
  });
}

async function uploadThumbnailsToS3(
  projectId: string,
  scenes: Scene[],
): Promise<void> {
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
}
