import { $ } from "zx";

export async function generateThumbnail(videoUrl: string, timestamp: number, outputPath: string): Promise<void> {
  try {
    await $`ffmpeg -ss ${timestamp} -i ${videoUrl} -vframes 1 -vf scale=320:-1 -f image2 -c:v mjpeg -q:v 2 -y ${outputPath}`;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw error;
  }
}
