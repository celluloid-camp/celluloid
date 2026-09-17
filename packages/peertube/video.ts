import { getVideo } from "@celluloid/peertube-api";
import { createClient } from "@celluloid/peertube-api/client";

/**
 * Validate and fetch video information from PeerTube using the client library
 */
export async function fetchPeerTubeVideoDetails({
  baseUrl,
  videoId,
  options,
}: {
  baseUrl: string;
  videoId: string;
  options?: { password?: string };
}) {
  const client = createClient({ baseUrl });

  try {
    const headers =
      options?.password != null
        ? { "x-peertube-video-password": options.password }
        : undefined;

    const { data: videoData, error: apiError } = await getVideo({
      client,
      path: { id: videoId },
      ...(headers ? { headers } : {}),
    });

    if (apiError) {
      // Handle password-protected videos explicitly so the UI can prompt
      if ((apiError as { code?: string }).code === "video_requires_password") {
        const err = new Error("video_requires_password");
        (err as { code?: string }).code = apiError.code;
        throw err;
      }

      throw new Error(
        (apiError as { message?: string }).message ||
          "Failed to fetch video information",
      );
    }

    if (!videoData) {
      throw new Error(
        `Video not found videoId: ${videoId} on baseUrl: ${baseUrl}`,
      );
    }

    const title = videoData.name || "Untitled video";
    const description = videoData.description || "";

    // Get thumbnail from thumbnails array (PeerTube >= 8.1) or deprecated thumbnailPath
    let thumbnail = "";
    // handle deprecated thumbnailPath
    // @ts-expect-error - thumbnails is deprecated
    if (videoData?.thumbnails && videoData.thumbnails?.length > 0) {
      // @ts-expect-error - thumbnails is deprecated
      thumbnail = videoData.thumbnails[0]?.fileUrl || "";
    } else if (videoData.thumbnailPath) {
      thumbnail = new URL(videoData.thumbnailPath, baseUrl).toString();
    }

    return {
      title,
      description,
      thumbnail,
      videoId,
      baseUrl,
      videoDetails: videoData,
    };
  } catch (error) {
    // Preserve explicit password-required errors so callers can detect them
    if (
      error instanceof Error &&
      (error as { code?: string }).code === "video_requires_password"
    ) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to fetch video: ${error.message}`);
    }
    throw new Error("Failed to fetch video information");
  }
}

/**
 * Validate and fetch video information from PeerTube using the client library
 */
export async function fetchPeerTubeVideoDownloadInfo({
  baseUrl,
  videoId,
  options,
}: {
  baseUrl: string;
  videoId: string;
  options?: { password?: string };
}) {
  const client = createClient({ baseUrl });

  try {
    const headers =
      options?.password != null
        ? { "x-peertube-video-password": options.password }
        : undefined;

    const { data: videoData, error: apiError } = await getVideo({
      client,
      path: { id: videoId },
      ...(headers ? { headers } : {}),
    });

    if (apiError) {
      // Handle password-protected videos explicitly so the UI can prompt
      if ((apiError as { code?: string }).code === "video_requires_password") {
        const err = new Error("video_requires_password");
        (err as { code?: string }).code = apiError.code;
        throw err;
      }

      throw new Error(
        (apiError as { message?: string }).message ||
          "Failed to fetch video information",
      );
    }

    if (!videoData) {
      throw new Error(
        `Video not found videoId: ${videoId} on baseUrl: ${baseUrl}`,
      );
    }

    if (!videoData.downloadEnabled) {
      throw new Error(
        `Video download is not enabled for videoId: ${videoId} on baseUrl: ${baseUrl}`,
      );
    }

    return videoData;
  } catch (error) {
    // Preserve explicit password-required errors so callers can detect them
    if (
      error instanceof Error &&
      (error as { code?: string }).code === "video_requires_password"
    ) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to fetch video: ${error.message}`);
    }
    throw new Error("Failed to fetch video information");
  }
}
