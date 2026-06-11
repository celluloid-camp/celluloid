"use client";
import type { DetectionResultsModel } from "@celluloid/toolkit-api/types";
import { Box } from "@mui/material";
import { useMediaSelector } from "media-chrome/react/media-store";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { buildDetectionIndex, detectionsAtTime } from "./detection-at-time";
import type { DetectionTrack } from "./segments";
import { trackColor } from "./track-color";

type StudioDetectionOverlayProps = {
  analysis: DetectionResultsModel;
  tracks: DetectionTrack[];
  videoWidth: number;
  videoHeight: number;
};

export function StudioDetectionOverlay({
  analysis,
  tracks,
  videoWidth,
  videoHeight,
}: StudioDetectionOverlayProps) {
  const currentTime = useMediaSelector((state) => state.mediaCurrentTime);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: videoWidth,
    height: videoHeight,
  });

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new window.ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const detectionIndex = useMemo(
    () => buildDetectionIndex(analysis),
    [analysis],
  );

  const trackById = useMemo(
    () => new Map(tracks.map((track) => [track.objectId, track])),
    [tracks],
  );

  const t = currentTime ?? 0;

  const objects = useMemo(
    () =>
      detectionsAtTime({
        tracks,
        detectionIndex,
        trackById,
        t,
        videoWidth,
        videoHeight,
      }),
    [t, tracks, detectionIndex, trackById, videoWidth, videoHeight],
  );

  const scaleX = containerSize.width / videoWidth;
  const scaleY = containerSize.height / videoHeight;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {objects.map((obj) => {
        const color = trackColor(obj.id);
        return (
          <Box key={obj.id}>
            <Box
              sx={{
                position: "absolute",
                left: obj.bbox.x * scaleX,
                top: obj.bbox.y * scaleY,
                width: obj.bbox.width * scaleX,
                height: obj.bbox.height * scaleY,
                border: `2px solid ${color}`,
                bgcolor: `${color}22`,
                boxSizing: "border-box",
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: obj.bbox.x * scaleX,
                top: obj.bbox.y * scaleY - 18,
                bgcolor: color,
                color: "#fff",
                px: 1,
                py: 0.2,
                fontSize: 12,
                pointerEvents: "none",
                zIndex: 11,
                whiteSpace: "nowrap",
              }}
            >
              {obj.id}
            </Box>
          </Box>
        );
      })}
    </div>
  );
}
