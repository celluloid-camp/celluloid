import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Scene, ScenesResult } from "./types";

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
  "use step";
  // Create output directory
  const currentDate = new Date().toISOString().split("T")[0];
  const outputDir = path.join(
    os.tmpdir(),
    `${projectId}/scene_detection_${currentDate}`,
  );
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    // Replace zx command with native Node.js spawn
    const stdout = await new Promise<string>((resolve, reject) => {
      const ffmpegProcess = spawn("ffmpeg", [
        "-i",
        videoUrl,
        "-vf",
        `select='gt(scene,${threshold})',scale=320:-1,showinfo`,
        "-vsync",
        "vfr",
        "-start_number",
        "1",
        "-frame_pts",
        "0",
        path.join(outputDir, "thumbnail_%d.jpg"),
      ]);

      let output = "";
      let errorOutput = "";

      ffmpegProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
        // Extract timestamps using regex similar to grep
        const matches = data.toString().match(/pts_time:([0-9.]+)/g);
        if (matches) {
          // Extract just the numbers (similar to awk '{print $2}')
          const timestamps = matches
            .map((m: string) => m.split(":")[1])
            .filter(Boolean);
          // Add newline if output is not empty
          output += (output ? "\n" : "") + timestamps.join("\n");
        }
      });

      ffmpegProcess.on("close", (code) => {
        if (code === 0) {
          // Ensure we have clean output with unique timestamps
          const uniqueTimestamps = [...new Set(output.trim().split("\n"))]
            .filter(Boolean)
            .map(Number)
            .sort((a, b) => a - b); // Sort timestamps in ascending order
          resolve(uniqueTimestamps.join("\n"));
        } else {
          reject(
            new Error(
              `FFmpeg process exited with code ${code}\n${errorOutput}`,
            ),
          );
        }
      });

      ffmpegProcess.on("error", reject);
    });

    const timestamps = stdout.trim().split("\n").map(Number);
    const scenes: Scene[] = [];

    // Process the timestamps
    timestamps.forEach((currentTimestamp: number, index: number) => {
      const id = index + 1;
      const startTime = index === 0 ? 0 : (timestamps[index - 1] ?? 0);
      const endTime = currentTimestamp;

      const thumbnailPath = path.join(outputDir, `thumbnail_${id}.jpg`);

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
      return { outputDir, scenes };
    }

    return { outputDir, scenes };
  } catch (error) {
    console.error("Error processing video:", error);
    throw error;
  }
}
