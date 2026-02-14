import { db } from "@celluloid/db";
import { PeerTubeVideo } from "@celluloid/peertube";
import { FatalError } from "workflow";

export async function getMetadata(projectId: string) {
  "use step";

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      metadata: true,
    },
  });

  const metadata = project?.metadata as unknown as PeerTubeVideo;

  if (!metadata) {
    throw new FatalError("Project not found. Skipping retries.");
  }

  const videoUrl = metadata.streamingPlaylists[0]?.files
    .sort((a, b) => a.size - b.size) // Sort files by size in ascending order
    .find((file) => file.fileDownloadUrl)?.fileDownloadUrl; // Find the first file with a download URL
  const duration = metadata.duration || 0;

  if (!videoUrl) {
    throw new FatalError("No video URL found. Skipping retries.");
  }

  return { videoUrl, duration };
}
