import {
  chapter,
  db,
  eq,
  project,
  storage,
  VideoScenesErrorCode,
  VideoScenesStatus,
  videoScenes,
} from "@celluloid/db";
import { fetchPeerTubeVideoDownloadInfo } from "@celluloid/peertube/video";
import {
  getBucketName,
  uploadImageFile,
  uploadImageUrl,
} from "@celluloid/storage/client";
import { createJob, getJobResults } from "@celluloid/vision-api";
import { createClient } from "@celluloid/vision-api/client";
import { SceneDetectResultsModel } from "@celluloid/vision-api/types";
import { createHook, FatalError, sleep } from "workflow";
import { keys } from "../keys";
import type { VisionWebhook } from "../vision/webhook";

export async function sceneDetectWorkflow(projectId: string) {
  "use workflow";

  const info = await getProjectInfo(projectId);

  if (!info) {
    await updateSceneDetectStatus({
      projectId,
      status: "failed",
      errorCode: "internal_error",
      errorMessage: `Video file not found for project ${projectId}`,
    });
    throw new FatalError("Video URL not found");
  }

  try {
    const visionRun = await startSceneDetect({
      projectId,
      videoFileUrl: info.videoUrl,
    });

    console.log("Creating hook with token for scene detect", visionRun.job_id);
    const hook = createHook<VisionWebhook>({
      token: visionRun.job_id,
    });

    await updateSceneDetectStatus({
      projectId,
      status: "processing",
    });

    const result = await Promise.race([
      hook,
      sleep("20min").then(() => "timeout" as const),
    ]);

    if (result === "timeout") {
      throw new Error("Processing timed out after 20 minutes", {
        cause: "timeout",
      });
    }

    if (result.job_id) {
      await fetchSceneDetectResults({ projectId, visionJobId: result.job_id });
    }
  } catch (error) {
    await updateSceneDetectStatus({
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

async function startSceneDetect({
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
      job_type: "scene_detect",
      external_id: projectId,
      video_url: videoFileUrl,
      callback_url: env.VISION_CALLBACK_URL,
      params: {
        threshold: 30,
      },
    },
  });

  if (!analysisResponse) {
    throw new Error(
      "Failed to start scene detect, caused by: " + response.statusText,
      { cause: response.status },
    );
  }

  await db
    .insert(videoScenes)
    .values({
      projectId,
      status: "processing",
      visionJobId: analysisResponse.job_id,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: videoScenes.projectId,
      set: {
        status: "processing",
        visionJobId: analysisResponse.job_id,
        updatedAt: new Date().toISOString(),
      },
    });

  return analysisResponse;
}

async function fetchSceneDetectResults({
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
    console.error(
      "Failed to fetch scene detect results",
      response.status,
      response.statusText,
    );
    throw new FatalError("Failed to fetch vision analysis");
  }

  const sceneDetectResults = analysisResponse.data as SceneDetectResultsModel;

  if (!sceneDetectResults) {
    throw new FatalError("Failed to fetch vision analysis");
  }

  try {
    let spriteURL: string | null = null;
    let spriteStorageId: string | null = null;
    if (sceneDetectResults.total_scenes > 0) {
      if (!sceneDetectResults.sprite_url) {
        throw new FatalError("Sprite URL not found");
      }
      const s3ObjectName = `${projectId}/scene_detect/sprite.png`;

      spriteURL = await uploadImageUrl(
        s3ObjectName,
        sceneDetectResults.sprite_url,
      );

      [{ id: spriteStorageId }] = await db
        .insert(storage)
        .values({
          bucket: getBucketName(),
          path: s3ObjectName,
        })
        .returning();

      await db.insert(chapter).values(
        sceneDetectResults.scenes.map((scene) => ({
          projectId,
          startTime: scene.start_seconds,
          endTime: scene.end_seconds ?? 0,
          spriteURL: `${spriteURL}${scene.sprite_fragment}`,
          updatedAt: new Date().toISOString(),
        })),
      );
    }
    await db
      .update(videoScenes)
      .set({
        status: "completed",
        spriteStorageId: spriteStorageId,
        spriteURL: spriteURL,
      })
      .where(eq(videoScenes.projectId, projectId));
  } catch (error) {
    console.error("Error fetching scene detect results", error);
    throw new FatalError("Failed to fetch scene detect results");
  }
}

async function updateSceneDetectStatus({
  projectId,
  status,
  errorCode,
  errorMessage,
}: {
  projectId: string;
  status: VideoScenesStatus;
  errorCode?: VideoScenesErrorCode;
  errorMessage?: string;
}) {
  "use step";

  const data = {
    projectId,
    status,
    updatedAt: new Date().toISOString(),
    errorCode,
    errorMessage,
  };
  await db.insert(videoScenes).values(data).onConflictDoUpdate({
    target: videoScenes.projectId,
    set: data,
  });
}
