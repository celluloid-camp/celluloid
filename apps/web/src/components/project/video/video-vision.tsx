"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useMediaSelector } from "media-chrome/react/media-store";
import { useTRPC } from "@/lib/trpc/client";
import { DetectionOverlay } from "../studio/detection-overlay";

export function VideoVision({ projectId }: { projectId: string }) {
  const api = useTRPC();
  const { data: analysis } = useSuspenseQuery(
    api.vision.byProjectId.queryOptions({
      projectId,
    }),
  );
  if (!analysis || !analysis.data) {
    return null;
  }
  return (
    <DetectionOverlay
      analysis={analysis.data}
      videoWidth={analysis.data.metadata.video.width}
      videoHeight={analysis.data.metadata.video.height}
    />
  );
}
