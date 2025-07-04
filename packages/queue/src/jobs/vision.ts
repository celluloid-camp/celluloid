import { type PrismaClient, prisma } from "@celluloid/prisma";
import type { PeerTubeVideo } from "@celluloid/types";
import { createAnalyzeVideoTask } from "@celluloid/vision";
import { createQueue } from "@mgcrea/prisma-queue";
import { env } from "../env";

type VisionJobPayload = { projectId: string, callbackUrl: string };
type JobResult = { status: number };


export const visionQueue = createQueue<VisionJobPayload, JobResult>(
  { name: "vision", prisma: prisma as unknown as PrismaClient },
  async (job, prisma) => {
    const { id, payload } = job;
    console.log(
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

    if (!videoUrl) {
      console.error("No video file found");
      return { status: 404 };
    }

    console.log("Vision queue processing -- metadata loaded", {
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
      console.log("Vision queue processing -- task created", {
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

      console.log(`Finished job#${id} with status=${status}`);
      return {
        status,
        videoAnalysisJobId: task.job_id,
      };

    } catch (error) {
      console.error("Failed to create video analysis task", error);
      return { status: 500 };
    }

  },
);
