"use client";

import { Box } from "@mui/material";
import React, { useRef, useEffect, useMemo, useState } from "react";
import { Stage, Layer, Rect, Circle, Ellipse, Line } from "react-konva";
import { useShapesStore } from "./shapes-store";
import { SHAPE_STYLES, DEFAULT_DIMENSIONS, SHAPE_TYPES } from "./shapes-config";
import { ShapeTooltip } from "./shape-tooltip";
import { Shape } from "./types";

type Dimensions = {
  width: number;
  height: number;
};

type TooltipState = {
  shape: Shape;
  x: number;
  y: number;
} | null;

export function ShapesViewer() {
  const shapes = useShapesStore((state) => state.shapes);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] =
    React.useState<Dimensions>(DEFAULT_DIMENSIONS);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    const observer = new window.ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      observer.disconnect();
    };
  }, []);

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const shape = shapes.find((s) => {
      const x = s.x * dimensions.width;
      const y = s.y * dimensions.height;

      if (s.type === SHAPE_TYPES.RECT) {
        return (
          pointer.x >= x &&
          pointer.x <= x + (s.width || 0) * dimensions.width &&
          pointer.y >= y &&
          pointer.y <= y + (s.height || 0) * dimensions.height
        );
      }

      if (s.type === SHAPE_TYPES.CIRCLE) {
        const radius = (s.radius || 0) * dimensions.width;
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= radius;
      }

      if (s.type === SHAPE_TYPES.ELLIPSE) {
        const radiusX = (s.radiusX || 0) * dimensions.width;
        const radiusY = (s.radiusY || 0) * dimensions.height;
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
        const x = shape.x * dimensions.width;
        const y = shape.y * dimensions.height;

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
                width={(shape.width || 0) * dimensions.width}
                height={(shape.height || 0) * dimensions.height}
                {...SHAPE_STYLES.common}
              />
            );
          case SHAPE_TYPES.CIRCLE:
            return (
              <Circle
                key={shape.id}
                x={x}
                y={y}
                radius={(shape.radius || 0) * dimensions.width}
                {...SHAPE_STYLES.common}
              />
            );
          case SHAPE_TYPES.ELLIPSE:
            return (
              <Ellipse
                key={shape.id}
                x={x}
                y={y}
                radiusX={(shape.radiusX || 0) * dimensions.width}
                radiusY={(shape.radiusY || 0) * dimensions.height}
                {...SHAPE_STYLES.common}
              />
            );
          case SHAPE_TYPES.POINT:
            return (
              <Circle key={shape.id} x={x} y={y} {...SHAPE_STYLES.point} />
            );
          default:
            return null;
        }
      }),
    [shapes, dimensions],
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        margin: 0,
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Layer>{renderedShapes}</Layer>
      </Stage>
      {tooltip && (
        <ShapeTooltip shape={tooltip.shape} x={tooltip.x} y={tooltip.y} />
      )}
    </Box>
  );
}
