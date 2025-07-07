"use client";

import { Box, Button, colors } from "@mui/material";
import { useVideoPlayerProgress } from "@/components/video-player/store";
import { trpc } from "@/lib/trpc/client";
import { formatDuration } from "@/utils/duration";
import { DetectionOverlay } from "../studio/detection-overlay";

export function VideoVision({ projectId }: { projectId: string }) {
  const videoProgress = useVideoPlayerProgress();
  const [analysis] = trpc.vision.byProjectId.useSuspenseQuery({
    projectId,
  });
  if (!analysis || !analysis.processing || !analysis.processing.metadata) {
    return null;
  }
  return (
    <>
      {/* <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <Button variant="contained" size="small">
          Detection
        </Button>
      </Box> */}
      <DetectionOverlay
        analysis={analysis.processing}
        currentTime={videoProgress}
        videoWidth={analysis.processing.metadata.video.width}
        videoHeight={analysis.processing.metadata.video.height}
      />
    </>
  );
}
