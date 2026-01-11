import { type PrismaClient, prisma } from "@celluloid/db";
import type { PeerTubeVideo } from "@celluloid/types";
import logger from "@celluloid/utils/logger";
import { createAnalyzeVideoTask, getJobResult } from "@celluloid/vision";
import { createQueue } from "@mgcrea/prisma-queue";
import { Client } from "minio";
import { env } from "../env";
import { sendProjectAnalysisFinished } from "../mailer/send-mail";
import { parseUrl } from "../utils/s3";

type VisionJobPayload = { projectId: string; callbackUrl: string };
type JobResult = { status: number };

const log = logger.child({ job: "vision" });

export const visionQueue = createQueue<VisionJobPayload, JobResult>(
  { name: "vision", prisma: prisma as unknown as PrismaClient },
  async (job, prisma) => {
    const { id, payload } = job;
    log.debug(
      `Vision queue processing job#${id} with payload=${JSON.stringify(payload)})`,
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

    log.debug("Vision queue processing -- video url", {
      videoUrl,
      duration,
      jobId: job.id,
    });
    if (!videoUrl) {
      log.error("No video file found");
      return { status: 404 };
    }

    log.debug("Vision queue processing -- metadata loaded", {
      videoUrl,
      duration,
      jobId: job.id,
    });

    try {
      const task = await createAnalyzeVideoTask({
        videoUrl,
        projectId: payload.projectId,
        callbackUrl: payload.callbackUrl,
      });
      log.debug("Vision queue processing -- task created", {
        task,
      });

      await prisma.videoAnalysis.upsert({
        where: { projectId: payload.projectId },
        update: {
          status: "pending",
          visionJobId: task.job_id,
        },
        create: {
          projectId: payload.projectId,
          status: "pending",
          visionJobId: task.job_id,
        },
      });

      const status = 200;

      log.debug(`Finished job#${id} with status=${status}`);
      return {
        status,
        videoAnalysisJobId: task.job_id,
      };
    } catch (error) {
      log.error("Failed to create video analysis task", error);
      return { status: 500 };
    }
  },
);

export const visionResultQueue = createQueue<
  {
    projectId: string;
  },
  JobResult
>(
  { name: "vision-result", prisma: prisma as unknown as PrismaClient },
  async (job, prisma) => {
    const { id, payload } = job;
    log.debug(
      `Vision result queue processing job#${id} with payload=${JSON.stringify(payload)})`,
    );

    const analysis = await prisma.videoAnalysis.findUnique({
      where: { projectId: payload.projectId },
      select: {
        status: true,
        visionJobId: true,
        project: {
          select: {
            title: true,
            user: {
              select: {
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!analysis) {
      log.error("No video analysis job found");
      return { status: 404 };
    }

    log.debug("Vision result queue processing -- analysis", {
      analysis,
    });

    if (analysis.status === "pending" && analysis.visionJobId) {
      const result = await getJobResult(analysis.visionJobId);

      if (!result) {
        log.error("No result found");
        return { status: 404 };
      }

      if (result) {
        const spritepathUrl = result?.metadata.sprite.path;

        log.debug("Vision result queue processing -- sprite path", {
          spritepathUrl,
        });

        await prisma.videoAnalysis.update({
          where: { projectId: payload.projectId },
          data: {
            status: "completed",
            processing: result,
          },
        });

        try {
          const spritePath = await uploadSpriteToS3(
            payload.projectId,
            spritepathUrl,
          );

          const spriteStorage = await prisma.storage.create({
            data: {
              bucket: env.STORAGE_BUCKET,
              path: spritePath,
            },
          });
          await prisma.videoAnalysis.update({
            where: { projectId: payload.projectId },
            data: {
              sprite: {
                connect: {
                  id: spriteStorage.id,
                },
              },
            },
          });
          if (analysis.project.user.email) {
            await sendProjectAnalysisFinished({
              email: analysis.project.user.email,
              projectId: payload.projectId,
              projectTitle: analysis.project.title,
            });
          }
        } catch (error) {
          log.error("Failed to upload sprite to S3", error);
        }
      }

      return { status: 200 };
    }

    return { status: 200 };
  },
);

async function uploadSpriteToS3(
  projectId: string,
  spriteUrl: string,
): Promise<string> {
  const storageUrlInfo = parseUrl(env.STORAGE_URL);

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

  const s3ObjectName = `${projectId}/analysis/sprite.png`;

  // 1. Download the file (using fetch, axios, or another HTTP client)
  const response = await fetch(spriteUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 2. Upload to S3/MinIO
  await minioClient.putObject(
    env.STORAGE_BUCKET,
    s3ObjectName,
    buffer,
    buffer.length,
    { "Content-Type": "image/jpeg" },
  );

  log.debug(`Uploaded ${s3ObjectName} to ${env.STORAGE_BUCKET}`);

  return s3ObjectName;
}
