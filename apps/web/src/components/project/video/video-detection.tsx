"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMediaSelector } from "media-chrome/react/media-store";
import { useTRPC } from "@/lib/trpc/client";
import { DetectionOverlay } from "../studio/detection-overlay";
import { useShownDetectionOverlayState } from "./annotation/useAnnotationEditor";

export function VideoObjectDetection({ projectId }: { projectId: string }) {
  const api = useTRPC();
  const [shownDetectionOverlay] = useShownDetectionOverlayState();
  const { data: analysis } = useQuery(
    api.vision.byProjectId.queryOptions({
      projectId,
    }),
  );
  if (!analysis || !analysis.data || !shownDetectionOverlay) {
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
