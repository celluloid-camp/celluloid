import { db, eq, project } from "@celluloid/db";
import { sleep } from "workflow";
import { detectScenes } from "./steps/detect-scenes";
import { getMetadata } from "./steps/get-metadata";
import { updateProjectScenes } from "./steps/update-project-scenes";
import { uploadThumbnails } from "./steps/upload-thumbnails";

export async function processScenesWorkflow(projectId: string) {
  "use workflow";

  await updateProjectStatus(projectId, "in_progress");

  try {
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
      await updateProjectScenes(projectId, updatedScenes);
    }
    await updateProjectStatus(projectId, "completed");
  } catch (error) {
    await updateProjectStatus(projectId, "failed");
    throw error;
  }
}

export async function updateProjectStatus(
  projectId: string,
  status: "completed" | "failed" | "in_progress",
) {
  "use step";

  await db
    .update(project)
    .set({
      scenesProcessingStatus: status,
    })
    .where(eq(project.id, projectId));
}
