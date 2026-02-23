import { db, eq, project, storage, videoAnalysis } from "@celluloid/db";
import { sendProjectAnalysisCompletedEmail } from "@celluloid/emails";
import { PeerTubeVideo } from "@celluloid/peertube";
import {
  getBucketName,
  uploadImageFile,
  uploadImageUrl,
} from "@celluloid/storage/client";
import { createAnalysisJob, getJobResults } from "@celluloid/vision-api";
import { createClient } from "@celluloid/vision-api/client";
import { createHook, FatalError } from "workflow";
import { z } from "zod";
import { keys } from "../keys";
import { getMetadata } from "../scenes-processing/steps/get-metadata";
import { VisionWebhook } from "./webhook";

export async function visionAnalysisWorkflow(projectId: string) {
  "use workflow";

  const { videoUrl } = await getMetadata(projectId);

  if (!videoUrl) {
    throw new FatalError("Project not found");
  }

  await startVisionAnalysis({ projectId, videoFileUrl: videoUrl });

  const hook = createHook<VisionWebhook>({
    token: `vision_results:${projectId}`,
  });

  const result = await hook;
  if (result.job_id) {
    await fetchVisionAnalysis({ projectId, visionJobId: result.job_id });
    await sendProjectNotificationEmail({ projectId });
  }
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

  const { data: analysisResponse, response } = await createAnalysisJob({
    client,
    headers: {
      "x-api-key": env.VISION_API_KEY,
    },
    body: {
      external_id: projectId,
      video_url: videoFileUrl,
      // callback_url: `${env.BASE_URL}/api/vision/webhook`,
      callback_url: `https://b988-41-251-30-20.ngrok-free.app/api/vision/webhook/callback`,
    },
  });

  if (!analysisResponse || response.status !== 200) {
    throw new FatalError("Failed to start vision analysis");
  }

  await db
    .update(videoAnalysis)
    .set({
      status: "processing",
      visionJobId: analysisResponse.job_id,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(videoAnalysis.projectId, projectId));
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

  const analysis = analysisResponse.data;

  if (!analysis) {
    throw new FatalError("Failed to fetch vision analysis");
  }
  await db
    .update(videoAnalysis)
    .set({
      status: "completed",
      processing: analysisResponse,
    })
    .where(eq(videoAnalysis.projectId, projectId))
    .returning();

  const spritepathUrl = analysis.metadata.sprite.path;

  const s3ObjectName = `${projectId}/analysis/sprite.png`;

  await uploadImageUrl(s3ObjectName, spritepathUrl);

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
    })
    .where(eq(videoAnalysis.projectId, projectId))
    .returning();

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
