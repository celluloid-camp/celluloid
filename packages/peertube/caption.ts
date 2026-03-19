import { getVideoCaptions } from "@celluloid/peertube-api";
import { createClient } from "@celluloid/peertube-api/client";
import { VideoCaption } from "@celluloid/peertube-api/types";
import { parseResponse as parseVideoCaptions } from "media-captions";

export async function fetchPeerTubeCaptionList(
  baseUrl: string,
  videoId: string,
) {
  const client = createClient({ baseUrl });

  try {
    const { data: captionsResponse } = await getVideoCaptions({
      client,
      path: { id: videoId },
    });

    // Handle different response structures: { data: [...] } or { total: 1, data: [...] }
    const captionsData = Array.isArray(captionsResponse)
      ? captionsResponse
      : captionsResponse?.data || [];

    if (!Array.isArray(captionsData) || captionsData.length === 0) {
      return [];
    }

    // Return only caption metadata (language and URL)
    const base = baseUrl.replace(/\/$/, "");
    return captionsData.map((caption) => {
      // Handle language as object { id: "fr", label: "French" } or string
      const language =
        typeof caption.language === "string"
          ? caption.language
          : caption.language?.id || "en";
      const raw = caption as { fileUrl?: string; captionPath?: string };
      const fileUrl =
        raw.fileUrl ||
        (raw.captionPath ? new URL(raw.captionPath, base).toString() : "");

      return {
        language,
        captionData: caption,
        fileUrl,
      };
    });
  } catch (error) {
    // Silently fail for captions - they're optional
    console.warn("Failed to fetch caption list:", error);
    return [];
  }
}

/**
 * Fetch and parse subtitles from PeerTube video
 */
export async function parsePeerTubeVideoCaptions(
  baseUrl: string,
  caption: VideoCaption & { captionPath?: string },
) {
  const captionUrl = resolveCaptionUrl(caption, baseUrl);
  try {
    const parsed = await parseVideoCaptions(fetch(captionUrl));

    // Convert parsed captions to our format
    return parsed.cues.map((cue) => ({
      text: cue.text || "",
      startTime: cue.startTime,
      endTime: cue.endTime,
    }));
  } catch (error) {
    // Silently fail for subtitles - they're optional
    console.warn("Failed to fetch subtitles:", error);
    return [];
  }
}

/**
 * Resolve caption URL from fileUrl or captionPath (relative to baseUrl).
 */
function resolveCaptionUrl(
  caption: VideoCaption & { captionPath?: string },
  baseUrl: string,
): string {
  if (caption.fileUrl) {
    return caption.fileUrl;
  }
  if (caption.captionPath) {
    return new URL(caption.captionPath, baseUrl).toString();
  }
  throw new Error("Caption fileUrl or captionPath is required");
}
