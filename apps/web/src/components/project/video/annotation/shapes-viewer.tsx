"use client";

import type { AnnotationShape } from "@celluloid/db";
import { Box } from "@mui/material";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import React, { useMemo, useRef, useState } from "react";
import { Circle, Ellipse, Layer, Line, Rect, Stage } from "react-konva";
import { ShapeTooltip } from "./shape-tooltip";
import { DEFAULT_DIMENSIONS, SHAPE_STYLES, SHAPE_TYPES } from "./shapes-config";

type TooltipState = {
  shape: AnnotationShapeWithMetadata;
  x: number;
  y: number;
} | null;

export type AnnotationShapeWithMetadata = AnnotationShape & {
  metadata: {
    color: string;
    initial: string;
    username: string;
    avatar?: string;
    text: string;
  };
};

export function ShapesViewer({
  shapes,
  width = DEFAULT_DIMENSIONS.width,
  height = DEFAULT_DIMENSIONS.height,
}: {
  shapes: AnnotationShapeWithMetadata[];
  width: number;
  height: number;
}) {
  const stageRef = useRef<any>(null);

  const dispatch = useMediaDispatch();
  const mediaPaused = useMediaSelector(
    (state) => typeof state.mediaPaused !== "boolean" || state.mediaPaused,
  );

  const handleClick = () => {
    if (mediaPaused) {
      dispatch({ type: MediaActionTypes.MEDIA_PLAY_REQUEST });
    } else {
      dispatch({ type: MediaActionTypes.MEDIA_PAUSE_REQUEST });
    }
  };

  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const handleMouseMove = (e) => {
    const stage = stageRef.current.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const shape = shapes.find((s) => {
      const x = s.x * width;
      const y = s.y * height;

      if (s.type === SHAPE_TYPES.RECT) {
        return (
          pointer.x >= x &&
          pointer.x <= x + (s.width || 0) * width &&
          pointer.y >= y &&
          pointer.y <= y + (s.height || 0) * height
        );
      }

      if (s.type === "circle") {
        const radius = (s.radius || 0) * width;
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= radius;
      }

      if (s.type === SHAPE_TYPES.ELLIPSE) {
        const radiusX = (s.radiusX || 0) * width;
        const radiusY = (s.radiusY || 0) * height;
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        return (
          (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1
        );
      }

      if (s.type === SHAPE_TYPES.POINT) {
        const radius = 8;
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= radius;
      }

      if (s.type === SHAPE_TYPES.POLYGON && s.points) {
        // Simple point-in-polygon check
        let inside = false;
        for (let i = 0, j = s.points.length - 2; i < s.points.length; i += 2) {
          const xi = s.points[i];
          const yi = s.points[i + 1];
          const xj = s.points[j];
          const yj = s.points[j + 1];

          const intersect =
            yi > pointer.y !== yj > pointer.y &&
            pointer.x < ((xj - xi) * (pointer.y - yi)) / (yj - yi) + xi;
          if (intersect) inside = !inside;
          j = i;
        }
        return inside;
      }

      return false;
    });

    if (shape) {
      setTooltip({
        shape,
        x: pointer.x,
        y: pointer.y,
      });
    } else {
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // Memoize the rendered shapes
  const renderedShapes = useMemo(
    () =>
      shapes.map((shape) => {
        const x = shape.x * width;
        const y = shape.y * height;

        if (shape.type === SHAPE_TYPES.POLYGON) {
          return (
            <Line
              key={shape.id}
              points={shape.points}
              closed={true}
              {...SHAPE_STYLES.common}
            />
          );
        }

        switch (shape.type) {
          case SHAPE_TYPES.RECT:
            return (
              <Rect
                key={shape.id}
                x={x}
                y={y}
                width={(shape.width || 0) * width}
                height={(shape.height || 0) * height}
                {...SHAPE_STYLES.common}
              />
            );
          case "circle":
            return (
              <Circle
                key={shape.id}
                x={x}
                y={y}
                radius={(shape.radius || 0) * width}
                {...SHAPE_STYLES.common}
              />
            );
          case SHAPE_TYPES.ELLIPSE:
            return (
              <Ellipse
                key={shape.id}
                x={x}
                y={y}
                radiusX={(shape.radiusX || 0) * width}
                radiusY={(shape.radiusY || 0) * height}
                {...SHAPE_STYLES.common}
              />
            );
          // default to point
          default:
            return (
              <Circle key={shape.id} x={x} y={y} {...SHAPE_STYLES.point} />
            );
        }
      }),
    [shapes, width, height],
  );

  return (
    <>
      <Stage
        ref={stageRef}
        width={width}
        height={height - 100}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 20,
        }}
      >
        <Layer listening={false} preventDefault={false}>
          {renderedShapes}
        </Layer>
      </Stage>
      {tooltip && (
        <ShapeTooltip data={tooltip.shape} x={tooltip.x} y={tooltip.y} />
      )}
    </>
  );
}
