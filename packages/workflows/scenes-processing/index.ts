import { sleep } from "workflow";
import { detectScenes } from "./steps/detect-scenes";
import { getMetadata } from "./steps/get-metadata";
import { updateProject } from "./steps/update-project";
import { uploadThumbnails } from "./steps/upload-thumbnails";

export async function processScenesWorkflow(projectId: string) {
  "use workflow";

  const metadata = await getMetadata(projectId);

  const result = await Promise.race([
    detectScenes({
      projectId,
      videoUrl: metadata.videoUrl,
      duration: metadata.duration,
    }),
    sleep("30s").then(() => "timeout" as const),
  ]);

  if (result === "timeout") {
    throw new Error("Processing timed out after 30 seconds");
  }

  const { scenes } = result;
  if (scenes.length > 0) {
    const updatedScenes = await uploadThumbnails(projectId, scenes);
    await updateProject(projectId, updatedScenes);
  }
}
