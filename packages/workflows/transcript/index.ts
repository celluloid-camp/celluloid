import { db, eq, project } from "@celluloid/db";
import { sleep } from "workflow";
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
      sleep("5min").then(() => "timeout" as const),
    ]);

    if (result === "timeout") {
      throw new Error("Processing timed out after 30 seconds");
    }

    const transcript = result;
    await updateProjectTranscript(
      projectId,
      transcript,
      captions.language,
      captions,
    );

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
      // transcriptProcessingRunId: null,
    })
    .where(eq(project.id, projectId));
}
