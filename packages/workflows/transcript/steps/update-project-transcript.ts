import { db, eq, project, projectTranscript } from "@celluloid/db";
import { Caption } from "@celluloid/peertube/client";

export async function updateProjectTranscript(
  projectId: string,
  transcript: string,
  language: string,
) {
  "use step";

  await db.insert(projectTranscript).values({
    projectId,
    content: transcript,
    language: language,
    updatedAt: new Date().toISOString(),
  });

  await db
    .update(project)
    .set({
      transcriptProcessingStatus: "completed",
      transcriptProcessingRunId: null,
    })
    .where(eq(project.id, projectId));
}
