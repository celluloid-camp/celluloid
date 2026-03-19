import { db, eq, project } from "@celluloid/db";
import {
  fetchPeerTubeCaptionList,
  parsePeerTubeVideoCaptions,
} from "@celluloid/peertube/caption";
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

  const normalizedHost = /^https?:\/\//i.test(foundProject.host)
    ? foundProject.host
    : `https://${foundProject.host}`;

  const captions = await fetchPeerTubeCaptionList(
    normalizedHost,
    foundProject.videoId,
  );
  if (captions.length === 0) {
    throw new FatalError("No captions found. Skipping retries.");
  }

  const parsedCaption = await parsePeerTubeVideoCaptions(
    normalizedHost,
    captions[0].captionData,
  );

  return parsedCaption;
}
