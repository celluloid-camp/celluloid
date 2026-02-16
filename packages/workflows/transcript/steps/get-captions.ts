import { db, eq, project } from "@celluloid/db";
import { getPeerTubeCaptions } from "@celluloid/peertube/client";
import { FatalError } from "workflow";

export async function getProjectCaptions(projectId: string) {
  "use step";

  const foundProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    columns: {
      id: true,
      videoId: true,
      host: true,
    },
  });

  if (!foundProject || !foundProject.videoId || !foundProject.host) {
    throw new FatalError("Project not found. Skipping retries.");
  }

  const captions = await getPeerTubeCaptions({
    videoId: foundProject.videoId,
    host: foundProject.host,
  });
  const frenchCaption = captions.find((caption) => caption.language === "fr");
  if (!frenchCaption) {
    throw new FatalError("No French caption found. Skipping retries.");
  }
  return frenchCaption;
}
