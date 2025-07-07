import { env } from "./env";
import { getJobStatusStatusJobIdGet, startDetectionAnalysePost } from "./generated/endpoints";
import type { DetectionResultsModel } from "./generated/models";

export * from "./generated/models";
import "./prisma";

export * from "./generated/schema.zod";

export async function createAnalyzeVideoTask({
  videoUrl,
  projectId,
  callbackUrl,
}: {
  videoUrl: string;
  projectId: string;
  callbackUrl: string;
}) {
  const response = await startDetectionAnalysePost({
    project_id: projectId,
    video_url: videoUrl,
    similarity_threshold: 0.5,
    callback_url: callbackUrl,
  }, {
    headers: {
      "x-api-key": env.VISION_API_KEY,
    },
  });

  console.log("response", response);
  if (response.status !== 202) {
    console.error(`Failed to create video analysis task: ${response.status}`);
    throw new Error(`Failed to create video analysis task: ${response.status}`);
  }

  return response.data;
}


export async function getJobResult(jobId: string) {
  const response = await getJobStatusStatusJobIdGet(jobId, {
    headers: {
      "x-api-key": env.VISION_API_KEY,
    },
  });


  if (response.status !== 200) {
    console.error(`Failed to get job result: ${response.status}`);
    throw new Error(`Failed to get job result: ${response.status}`);
  }

  if (response.data.result_path) {
    const result = await fetch(new URL(response.data.result_path, env.VISION_API_URL).toString());
    const json = await result.json() as DetectionResultsModel;

    const spritePath = json?.metadata.sprite.path;
    const spriteUrl = new URL(spritePath, env.VISION_API_URL).toString();

    return {
      ...json,
      metadata: {
        ...json.metadata,
        sprite: {
          ...json.metadata.sprite,
          path: spriteUrl
        },
      },
    } as DetectionResultsModel;
  }
  return null;
}


