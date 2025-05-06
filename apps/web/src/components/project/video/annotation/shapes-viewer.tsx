"use client";

import { Box } from "@mui/material";
import React, { useRef, useEffect, useMemo } from "react";
import { Stage, Layer, Rect, Circle, Ellipse, Line } from "react-konva";
import { useShapesStore } from "./shapes-store";
import { SHAPE_STYLES, DEFAULT_DIMENSIONS, SHAPE_TYPES } from "./shapes-config";

type Dimensions = {
  width: number;
  height: number;
};

export function ShapesViewer() {
  const shapes = useShapesStore((state) => state.shapes);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] =
    React.useState<Dimensions>(DEFAULT_DIMENSIONS);

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
      <Stage ref={stageRef} width={dimensions.width} height={dimensions.height}>
        <Layer>{renderedShapes}</Layer>
      </Stage>
    </Box>
  );
}
