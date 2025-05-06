"use client";

import { Box, Paper, Typography } from "@mui/material";
import { Shape } from "./types";

interface ShapeTooltipProps {
  shape: Shape;
  x: number;
  y: number;
}

export function ShapeTooltip({ shape, x, y }: ShapeTooltipProps) {
  const getShapeInfo = () => {
    switch (shape.type) {
      case "rect":
        return `Rectangle (${Math.round(shape.width! * 100)}% × ${Math.round(
          shape.height! * 100,
        )}%)`;
      case "circle":
        return `Circle (${Math.round(shape.radius! * 100)}% radius)`;
      case "ellipse":
        return `Ellipse (${Math.round(shape.radiusX! * 100)}% × ${Math.round(
          shape.radiusY! * 100,
        )}%)`;
      case "polygon":
        return `Polygon (${shape.points!.length / 2} points)`;
      case "point":
        return "Point";
      default:
        return "Unknown shape";
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        left: x + 10,
        top: y + 10,
        padding: 1,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {getShapeInfo()}
      </Typography>
    </Paper>
  );
}
