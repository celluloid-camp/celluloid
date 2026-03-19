import { db, eq, project } from "@celluloid/db";
import { PeerTubeVideo } from "@celluloid/peertube";
import { fetchPeerTubeVideoDownloadInfo } from "@celluloid/peertube/video";
import { FatalError } from "workflow";

export async function getProjectDownloadInfo(projectId: string) {
  "use step";

  const foundProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    columns: {
      host: true,
      videoId: true,
    },
  });

  if (!foundProject?.host || !foundProject?.videoId) {
    throw new FatalError("No video host or videoId found. Skipping retries.");
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
    throw new FatalError("No video URL found. Skipping retries.");
  }

  return { videoUrl, duration: info.duration ?? 0 };
}
