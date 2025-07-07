"use client";
import type { DetectionResultsModel } from "@celluloid/vision";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useSnackbar } from "notistack";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { DetectionOverlay } from "./detection-overlay";
import { VisionStudioObjectsTab } from "./object-tab";
import { Timeline } from "./timeline";

const VIDEO_WIDTH = 888;

// Adapt height to maintain aspect ratio (original: width/height from metadata)
function getVideoHeight(metadata: { width: number; height: number }) {
  return Math.round((VIDEO_WIDTH / metadata.width) * metadata.height);
}

export function VisionStudio({ projectId }: { projectId: string }) {
  const [analysis] = trpc.vision.byProjectId.useSuspenseQuery({
    projectId: projectId,
  });
  if (!analysis || !analysis.processing) {
    return null;
  }
  return (
    <VisionStudioWrapper
      projectId={projectId}
      analysis={analysis.processing}
      sprite={analysis.sprite?.publicUrl}
    />
  );
}
function VisionStudioWrapper({
  projectId,
  analysis: initialAnalysis,
  sprite,
}: {
  projectId: string;
  analysis: DetectionResultsModel;
  sprite: string | undefined;
}) {
  const trpcUtils = trpc.useUtils();
  const { enqueueSnackbar } = useSnackbar();
  const [project] = trpc.project.byId.useSuspenseQuery({
    id: projectId,
  });

  const editAnalysis = trpc.vision.updateAnalysis.useMutation({
    onSuccess: () => {
      enqueueSnackbar("Analysis updated", {
        variant: "success",
      });
    },
    onSettled: () => {
      trpcUtils.vision.byProjectId.invalidate({
        projectId,
      });
    },
  });
  // --- Timeline/Objects Tabs State ---
  const [tab, setTab] = React.useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<number>(0);

  const videoDurationSec =
    initialAnalysis.metadata.processing.duration_seconds || 1;
  const actualVideoWidth = initialAnalysis.metadata.video.width;
  const actualVideoHeight = initialAnalysis.metadata.video.height;
  const VIDEO_HEIGHT = getVideoHeight(initialAnalysis.metadata.video);

  // Local analysis state for editing
  const [analysis, setAnalysis] =
    useState<DetectionResultsModel>(initialAnalysis);
  // Keep in sync with prop changes
  React.useEffect(() => {
    setAnalysis(initialAnalysis);
  }, [initialAnalysis]);

  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle video play/pause
  const handleVideoPlay = () => setIsPlaying(true);
  const handleVideoPause = () => setIsPlaying(false);

  const handleVideoTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    setCurrentTime(video.currentTime);

    // Find current frame
    const frameIndex = Math.floor(
      video.currentTime * initialAnalysis.metadata.video.fps,
    );
    setCurrentFrame(frameIndex);
  }, [initialAnalysis]);

  // Handle analysis change (merge, etc)
  const handleAnalysisChange = (updated: DetectionResultsModel) => {
    setAnalysis(updated);
    editAnalysis.mutate({
      projectId,
      analysis: updated,
    });
  };

  return (
    <Box display={"flex"} flexDirection={"column"}>
      <Box
        sx={{
          backgroundColor: "brand.orange",
          minHeight: "100vh",
          paddingY: 3,
        }}
      >
        <Container maxWidth="md">
          <Paper
            sx={{
              paddingY: 2,
              paddingX: 4,
              margin: 0,
              backgroundColor: "brand.green",
              minHeight: "100vh",
            }}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              gap={1}
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Box>
                <Link href={`/project/${projectId}`}>
                  <IconButton size="small">
                    <KeyboardArrowLeftIcon sx={{ color: "black" }} />
                  </IconButton>
                </Link>
                <Typography
                  variant="h5"
                  sx={{ fontFamily: "abril_fatfaceregular" }}
                >
                  Studio
                </Typography>
              </Box>
              <Typography align="left" variant="body1">
                {project.title}
              </Typography>
            </Box>

            <Box
              sx={{
                height: VIDEO_HEIGHT,
                width: VIDEO_WIDTH,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                  backgroundColor: "black",
                }}
              >
                <video
                  ref={videoRef}
                  src={initialAnalysis.metadata.video.source}
                  style={{
                    width: VIDEO_WIDTH,
                    height: VIDEO_HEIGHT,
                    objectFit: "contain",
                  }}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  crossOrigin="anonymous"
                  autoPlay={false}
                  muted={true}
                  loop={false}
                  controls={true}
                />

                {/* Overlay */}
                <DetectionOverlay
                  analysis={initialAnalysis}
                  currentTime={currentTime}
                  videoWidth={actualVideoWidth}
                  videoHeight={actualVideoHeight}
                />
              </Box>
            </Box>

            {/* --- Tabs and Timeline/Objects UI --- */}
            <Paper sx={{ padding: 2, marginTop: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Timeline" />
                <Tab label={`Detections`} />
              </Tabs>

              {tab === 0 && (
                <Timeline
                  analysis={initialAnalysis}
                  videoDurationSec={videoDurationSec}
                  sprite={sprite}
                  onChange={handleAnalysisChange}
                />
              )}

              {tab === 1 && (
                <VisionStudioObjectsTab
                  groupedById={(() => {
                    const map = new Map<string, any[]>();
                    for (const frame of initialAnalysis.frames) {
                      for (const obj of frame.objects) {
                        const objWithFrame = {
                          ...obj,
                          frame_idx: frame.frame_idx,
                          timestamp: frame.timestamp,
                        };
                        if (!map.has(obj.id)) map.set(obj.id, []);
                        map.get(obj.id)!.push(objWithFrame);
                      }
                    }
                    return Array.from(map.entries());
                  })()}
                  sprite={sprite}
                />
              )}
            </Paper>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
