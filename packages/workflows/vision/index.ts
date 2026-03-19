import {
  db,
  eq,
  project,
  storage,
  VideoAnalysisErrorCode,
  VideoAnalysisStatus,
  videoAnalysis,
} from "@celluloid/db";
import { sendProjectAnalysisCompletedEmail } from "@celluloid/emails";
import { PeerTubeVideo } from "@celluloid/peertube";
import { fetchPeerTubeVideoDownloadInfo } from "@celluloid/peertube/video";
import {
  getBucketName,
  uploadImageFile,
  uploadImageUrl,
} from "@celluloid/storage/client";
import { createJob, getJobResults } from "@celluloid/vision-api";
import { createClient } from "@celluloid/vision-api/client";
import { DetectionResultsModel } from "@celluloid/vision-api/types";
import { createHook, FatalError, sleep } from "workflow";
import { keys } from "../keys";
import { VisionWebhook } from "./webhook";

export async function visionAnalysisWorkflow(projectId: string) {
  "use workflow";

  const info = await getProjectInfo(projectId);

  if (!info) {
    throw new FatalError("Video URL not found");
  }

  try {
    const visionRun = await startVisionAnalysis({
      projectId,
      videoFileUrl: info.videoUrl,
    });
    const hook = createHook<VisionWebhook>({
      token: visionRun.job_id,
    });

    const result = await Promise.race([
      hook,
      sleep("20min").then(() => "timeout" as const),
    ]);

    if (result === "timeout") {
      await updateVisionAnalysisStatus({
        projectId,
        status: "failed",
        errorCode: "timeout",
      });
      throw new FatalError("Processing timed out after 20 minutes");
    }

    if (result.job_id) {
      await fetchVisionAnalysis({ projectId, visionJobId: result.job_id });
      await sendProjectNotificationEmail({ projectId });
    }
  } catch (error) {
    await updateVisionAnalysisStatus({
      projectId,
      status: "failed",
      errorCode: "internal_error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

async function getProjectInfo(projectId: string) {
  "use step";

  const foundProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    columns: {
      host: true,
      videoId: true,
    },
  });

  if (!foundProject?.host || !foundProject?.videoId) {
    throw new FatalError(
      "Project host or videoId not found. Skipping retries.",
    );
  }

  const normalizedHost = /^https?:\/\//i.test(foundProject.host)
    ? foundProject.host
    : `https://${foundProject.host}`;

  const info = await fetchPeerTubeVideoDownloadInfo({
    baseUrl: normalizedHost,
    videoId: foundProject.videoId,
  });

  if (
    (info?.streamingPlaylists?.length ?? 0) === 0 ||
    !info.streamingPlaylists?.[0]?.files
  ) {
    throw new FatalError("Project not found. Skipping retries.");
  }
  const videoUrl = info.streamingPlaylists[0].files
    .filter((file) => file.hasVideo === true && Boolean(file.fileDownloadUrl))
    .sort((a, b) => (a.size ?? 0) - (b.size ?? 0)) // Sort files by size in ascending order
    .find((file) => file.fileDownloadUrl)?.fileDownloadUrl;

  if (!videoUrl) {
    return null;
  }

  return { videoUrl, duration: info.duration ?? 0 };
}

async function startVisionAnalysis({
  projectId,
  videoFileUrl,
}: {
  projectId: string;
  videoFileUrl: string;
}) {
  "use step";

  const env = keys();
  const client = createClient({
    baseUrl: env.VISION_API_URL,
  });

  const { data: analysisResponse, response } = await createJob({
    client,
    headers: {
      "x-api-key": env.VISION_API_KEY,
    },
    body: {
      job_type: "object_detect",
      external_id: projectId,
      video_url: videoFileUrl,
      // callback_url: `${env.BASE_URL}/api/vision/webhook`,
      callback_url: `https://aad7-196-217-77-146.ngrok-free.app/api/vision/webhook`,
    },
  });

  if (!analysisResponse) {
    await updateVisionAnalysisStatus({
      projectId,
      status: "failed",
      errorCode: "internal_error",
      errorMessage: response.statusText,
    });
    throw new FatalError(
      "Failed to start vision analysis, caused by: " + response.statusText,
    );
  }

  await db
    .insert(videoAnalysis)
    .values({
      projectId,
      status: "processing",
      visionJobId: analysisResponse.job_id,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: videoAnalysis.projectId,
      set: {
        status: "processing",
        visionJobId: analysisResponse.job_id,
        updatedAt: new Date().toISOString(),
      },
    });

  return analysisResponse;
}

async function fetchVisionAnalysis({
  projectId,
  visionJobId,
}: {
  projectId: string;
  visionJobId: string;
}) {
  "use step";
  const env = keys();
  const client = createClient({
    baseUrl: env.VISION_API_URL,
  });

  const { data: analysisResponse, response } = await getJobResults({
    client,
    headers: {
      "x-api-key": env.VISION_API_KEY,
    },
    path: {
      job_id: visionJobId,
    },
  });

  if (response.status !== 200 || !analysisResponse) {
    throw new FatalError("Failed to fetch vision analysis");
  }

  const analysis = analysisResponse.data as DetectionResultsModel;

  if (!analysis) {
    throw new FatalError("Failed to fetch vision analysis");
  }
  await db
    .update(videoAnalysis)
    .set({
      status: "completed",
      data: analysis,
    })
    .where(eq(videoAnalysis.projectId, projectId))
    .returning();

  try {
    const s3ObjectName = `${projectId}/analysis/sprite.png`;

    const spriteURL = await uploadImageUrl(
      s3ObjectName,
      analysis.metadata.sprite.url,
    );

    const [spriteStorage] = await db
      .insert(storage)
      .values({
        bucket: getBucketName(),
        path: s3ObjectName,
      })
      .returning();

    await db
      .update(videoAnalysis)
      .set({
        status: "completed",
        spriteStorageId: spriteStorage.id,
        spriteURL: spriteURL,
      })
      .where(eq(videoAnalysis.projectId, projectId))
      .returning();
  } catch (error) {
    console.error("Error uploading sprite image", error);
  }
  return analysisResponse;
}

async function sendProjectNotificationEmail({
  projectId,
}: {
  projectId: string;
}) {
  "use step";

  const proj = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    columns: {
      id: true,
      userId: true,
      title: true,
    },
    with: {
      user: {
        columns: {
          email: true,
        },
      },
    },
  });

  if (!proj || !proj.user?.email) {
    // skip if project not found
    return;
  }

  await sendProjectAnalysisCompletedEmail({
    projectId: proj.id,
    projectTitle: proj.title,
    email: proj.user.email,
  });
}

async function updateVisionAnalysisStatus({
  projectId,
  status,
  errorCode,
  errorMessage,
}: {
  projectId: string;
  status: VideoAnalysisStatus;
  errorCode?: VideoAnalysisErrorCode;
  errorMessage?: string;
}) {
  "use step";

  await db
    .update(videoAnalysis)
    .set({
      status,
      updatedAt: new Date().toISOString(),
      errorCode: errorCode,
      errorMessage: errorMessage,
    })
    .where(eq(videoAnalysis.projectId, projectId));
}
