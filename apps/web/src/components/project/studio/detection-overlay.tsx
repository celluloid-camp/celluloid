"use client";
import type { DetectionResultsModel } from "@celluloid/vision";
import { Box } from "@mui/material";
import React, { useLayoutEffect, useRef, useState } from "react";

// Reusable overlay component for bounding boxes and labels
type DetectionOverlayProps = {
  analysis: DetectionResultsModel;
  currentTime: number;
  videoWidth: number;
  videoHeight: number;
};

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  analysis,
  currentTime,
  videoWidth,
  videoHeight,
}) => {
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

  // Find the frame closest to current time, with tolerance
  const tolerance = 0.5; // seconds
  let frame = analysis.frames.find(
    (f: any) =>
      Math.abs(f.timestamp - currentTime) <
      1 / (analysis.metadata.video.fps || 30),
  );
  if (!frame) {
    // If no frame is found, show the last frame before currentTime within tolerance
    const prevFrames = analysis.frames.filter(
      (f: any) =>
        f.timestamp < currentTime && currentTime - f.timestamp <= tolerance,
    );
    if (prevFrames.length > 0) {
      frame = prevFrames[prevFrames.length - 1];
    }
  }
  const objects = frame?.objects || [];

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
      {objects.map((obj: any, i: number) => (
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
            {obj.id}
          </Box>
        </React.Fragment>
      ))}
    </div>
  );
};
