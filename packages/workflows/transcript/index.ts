import { db, eq, project } from "@celluloid/db";
import { FatalError, sleep } from "workflow";
import { generateTranscript } from "./steps/generate-transcript";
import { getProjectCaptions } from "./steps/get-captions";
import { updateProjectTranscript } from "./steps/update-project-transcript";

export async function videoTranscriptWorkflow(projectId: string) {
  "use workflow";

  try {
    await updateProjectStatus(projectId, "in_progress");

    const captions = await getProjectCaptions(projectId);

    const result = await Promise.race([
      generateTranscript(captions),
      sleep("15min").then(() => "timeout" as const),
    ]);

    if (result === "timeout") {
      throw new FatalError("Processing timed out after 15 minutes");
    }

    const transcript = result;
    await updateProjectTranscript(projectId, transcript, "fr");

    await updateProjectStatus(projectId, "completed");
  } catch (error) {
    await updateProjectStatus(projectId, "failed");
    throw error;
  }
}

async function updateProjectStatus(
  projectId: string,
  status: "completed" | "failed" | "in_progress",
) {
  "use step";

  await db
    .update(project)
    .set({
      transcriptProcessingStatus: status,
    })
    .where(eq(project.id, projectId));
}
