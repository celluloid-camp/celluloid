import { db, eq, project } from "@celluloid/db";
import {
  fetchPeerTubeCaptionList,
  parsePeerTubeVideoCaptions,
} from "@celluloid/peertube/caption";
import { FatalError } from "workflow";

function pickCaptionTrack<T extends { language: string }>(
  captions: T[],
  preferredLanguage?: string | null,
): T {
  if (preferredLanguage) {
    const preferred = captions.find(
      (caption) =>
        caption.language.toLowerCase() === preferredLanguage.toLowerCase(),
    );
    if (preferred) {
      return preferred;
    }
  }
  return captions[0]!;
}

export async function getProjectCaptions(projectId: string) {
  "use step";

  const foundProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    columns: {
      id: true,
      videoId: true,
      host: true,
      metadata: true,
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

  const videoLanguage =
    typeof foundProject.metadata?.language === "string"
      ? foundProject.metadata.language
      : foundProject.metadata?.language?.id;

  const selectedCaption = pickCaptionTrack(captions, videoLanguage);

  const parsedCaption = await parsePeerTubeVideoCaptions(
    normalizedHost,
    selectedCaption.captionData,
  );

  return {
    language: selectedCaption.language,
    cues: parsedCaption,
  };
}
