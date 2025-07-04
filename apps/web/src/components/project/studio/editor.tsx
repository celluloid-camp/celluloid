"use client";
import ReactPlayer from "@celluloid/react-player";
import { OnProgressProps } from "@celluloid/react-player/base";
import type { DetectionResultsModel } from "@celluloid/vision";
import DeleteIcon from "@mui/icons-material/Delete";
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
import React, { useCallback, useEffect, useRef, useState } from "react";
import VideoPlayer from "@/components/video-player";
import { trpc } from "@/lib/trpc/client";
import { VisionStudioObjectsTab } from "./object-tab";

const VIDEO_WIDTH = 800;
const VIDEO_HEIGHT = 450;

export function VisionStudio({ projectId }: { projectId: string }) {
  const [analysis] = trpc.vision.byProjectId.useSuspenseQuery({
    projectId: projectId,
  });
  if (!analysis || !analysis.processing) {
    return null;
  }
  return (
    <VisionStudioWrapper projectId={projectId} analysis={analysis.processing} />
  );
}
function VisionStudioWrapper({
  projectId,
  analysis,
}: {
  projectId: string;
  analysis: DetectionResultsModel;
}) {
  const [project] = trpc.project.byId.useSuspenseQuery({
    id: projectId,
  });

  // --- Timeline/Objects Tabs State ---
  const [tab, setTab] = React.useState(0);

  const videoDurationSec = analysis.metadata.processing.duration_seconds || 1;
  const actualVideoWidth = analysis.metadata.video.width;
  const actualVideoHeight = analysis.metadata.video.height;

  // Flatten all objects with frame_idx
  const timelineObjects = React.useMemo(() => {
    return analysis.frames.flatMap((frame: any) =>
      frame.objects.map((obj: any) => ({
        ...obj,
        frame_idx: frame.frame_idx,
        timestamp: frame.timestamp, // <-- add this line!
      })),
    );
  }, [analysis]);

  const groupedByIdTimeline = React.useMemo(() => {
    const map = new Map<string, any[]>();
    for (const obj of timelineObjects) {
      if (!map.has(obj.id)) map.set(obj.id, []);
      map.get(obj.id)!.push(obj);
    }
    return Array.from(map.entries());
  }, [timelineObjects]);

  // Group by class for objects tab
  const groupedByClass = React.useMemo(() => {
    const map = new Map<string, any[]>();
    for (const obj of timelineObjects) {
      if (!map.has(obj.class_name)) map.set(obj.class_name, []);
      map.get(obj.class_name)!.push(obj);
    }
    return Array.from(map.entries());
  }, [timelineObjects]);

  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current) {
        const time = videoRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 500); // every second

    return () => clearInterval(interval);
  }, []);

  const currentFrame = React.useMemo(() => {
    if (!analysis) return null;
    // Find the frame with the closest timestamp to currentTime
    return analysis.frames.reduce((prev, curr) =>
      Math.abs(curr.timestamp - currentTime) <
      Math.abs(prev.timestamp - currentTime)
        ? curr
        : prev,
    );
  }, [analysis, currentTime]);

  const scaleX = VIDEO_WIDTH / actualVideoWidth;
  const scaleY = VIDEO_HEIGHT / actualVideoHeight;

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
            <Typography variant="h1">Studio</Typography>
            <Typography align="left" variant="h3">
              {project.title}
            </Typography>

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
                <ReactPlayer
                  url={`https://${project.host}/w/${project.videoId}`}
                  height={VIDEO_HEIGHT}
                  width={VIDEO_WIDTH}
                  ref={videoRef}
                  config={{
                    peertube: {
                      controls: 1,
                      controlBar: 1,
                      peertubeLink: 0,
                      title: 0,
                      warningTitle: 0,
                      p2p: 0,
                      autoplay: 0,
                    },
                  }}
                />
                {/* Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  <p>{currentTime}</p>
                  {currentFrame?.objects.map((obj, i) => (
                    <React.Fragment key={i}>
                      {/* Bounding box */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: obj.bbox.x * scaleX,
                          top: obj.bbox.y * scaleY,
                          width: obj.bbox.width * scaleX,
                          height: obj.bbox.height * scaleY,
                          border: "2px solid white",
                          boxSizing: "border-box",
                          pointerEvents: "none",
                          zIndex: 10,
                        }}
                      />
                      {/* Label */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: obj.bbox.x * scaleX,
                          top: obj.bbox.y * scaleY - 18,
                          bgcolor: "white",
                          color: "black",
                          px: 1,
                          py: 0.2,
                          fontSize: 12,
                          pointerEvents: "none",
                          zIndex: 11,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {obj.class_name} {obj.id}
                      </Box>
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* --- Tabs and Timeline/Objects UI --- */}
            <Paper sx={{ padding: 2, marginTop: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Timeline" />
                <Tab label={`Objects (${groupedByClass.length})`} />
              </Tabs>

              {tab === 0 && (
                <Box>
                  {groupedByIdTimeline.map(([id, objs]) => {
                    const first = objs[0];
                    return (
                      <Box
                        key={id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          p: 1,
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: "grey.200",
                            borderRadius: 1,
                            px: 1.5,
                            py: 0.5,
                            mr: 2,
                            minWidth: 60,
                            textAlign: "center",
                          }}
                        >
                          <Typography variant="caption" color="grey.700">
                            {first.class_name}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight="bold" fontSize={14}>
                            {id}
                          </Typography>
                          <Typography variant="caption" color="grey.600">
                            {first.class_name}
                          </Typography>
                        </Box>
                        {/* Timeline bar */}
                        <Box
                          sx={{
                            flex: 3,
                            mx: 2,
                            height: 16,
                            bgcolor: "grey.100",
                            borderRadius: 8,
                            position: "relative",
                            width: "100%",
                          }}
                        >
                          {objs.map((obj: any, i: number) => {
                            const position =
                              (obj.timestamp / videoDurationSec) * 100;
                            return (
                              <Box
                                key={i}
                                sx={{
                                  position: "absolute",
                                  left: `${Math.max(0, Math.min(100, position))}%`,
                                  top: 2,
                                  width: 8,
                                  height: 12,
                                  bgcolor: "primary.main",
                                  borderRadius: 8,
                                  opacity: 1,
                                  transform: "translateX(-50%)",
                                  zIndex: 10,
                                  transition: "transform 0.2s",
                                  cursor: "pointer",
                                  "&:hover": {
                                    transform: "translateX(-50%) scale(1.1)",
                                  },
                                }}
                                // Add your mouse events here if needed
                              />
                            );
                          })}
                        </Box>
                        <IconButton color="error" sx={{ ml: 2 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {tab === 1 && (
                <VisionStudioObjectsTab groupedByClass={groupedByClass} />
              )}
            </Paper>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
