import { spawn } from 'node:child_process';

/**
 * Generates a thumbnail image from a video at a specific timestamp
 * @param videoUrl - The URL or path to the video file
 * @param timestamp - The timestamp in seconds where to extract the thumbnail (e.g., 60 for 1 minute into the video)
 * @param outputPath - The path where the thumbnail should be saved
 * @returns Promise that resolves when the thumbnail is generated
 * @throws Error if FFmpeg process fails
 *
 * FFmpeg parameters used:
 * -ss: Seek to timestamp (in seconds)
 * -vframes: Extract 1 frame
 * -vf: Scale the output to 320px width while maintaining aspect ratio
 * -f: Force output format to image2
 * -c:v: Use MJPEG codec for output
 * -q:v: Set quality to 2 (high quality, lower number = better quality)
 * -y: Overwrite output file if it exists
 */
export async function generateThumbnail(videoUrl: string, timestamp: number, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn('ffmpeg', [
      '-ss', timestamp.toString(),
      '-i', videoUrl,
      '-vframes', '1',
      '-vf', 'scale=320:-1',
      '-f', 'image2',
      '-c:v', 'mjpeg',
      '-q:v', '2',
      '-y',
      outputPath
    ]);

    let errorOutput = '';

    ffmpegProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}\n${errorOutput}`));
      }
    });

    ffmpegProcess.on('error', reject);
  });
}
