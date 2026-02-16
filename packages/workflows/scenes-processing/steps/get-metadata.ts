import { db, eq, project } from "@celluloid/db";
import { PeerTubeVideo } from "@celluloid/peertube";
import { FatalError } from "workflow";

export async function getMetadata(projectId: string) {
  "use step";

  const foundProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    columns: {
      metadata: true,
    },
  });

  const metadata = foundProject?.metadata as unknown as PeerTubeVideo;

  if (!metadata) {
    throw new FatalError("Project not found. Skipping retries.");
  }
  const videoUrl = getVideoUrl(metadata);
  if (!videoUrl) {
    throw new FatalError("No video URL found. Skipping retries.");
  }

  return { videoUrl, duration: metadata.duration };
}

function getVideoUrl(metadata: PeerTubeVideo) {
  // if (metadata.files.length > 0) {
  //   const sortedFiles = metadata.files.sort((a, b) => a.size - b.size);
  //   return sortedFiles[0].fileDownloadUrl;
  // }
  if (
    metadata.streamingPlaylists.length > 0 &&
    metadata.streamingPlaylists[0]?.files.length > 0
  ) {
    return metadata.streamingPlaylists[0]?.files
      .sort((a, b) => a.size - b.size) // Sort files by size in ascending order
      .find((file) => file.fileDownloadUrl)?.fileDownloadUrl; // Find the first file with a download URL
  }
  return null;
}
