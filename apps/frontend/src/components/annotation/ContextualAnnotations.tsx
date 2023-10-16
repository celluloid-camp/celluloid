import {
  type UseParentSizeOptions,
  useParentSize,
} from "@cutting/use-get-parent-size";
import CancelIcon from "@mui/icons-material/Clear";
import { alpha, Box, Fade, IconButton, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import React, { memo, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { AnnotationByProjectIdItem, ProjectById, trpc } from "~utils/trpc";
import { getUserColor } from "~utils/UserUtils";

function toAbsolutePosition(
  relativeX: number,
  relativeY: number,
  parentWidth: number,
  parentHeight: number
) {
  // Calculate the absolute position based on parent's dimensions
  const absoluteX = relativeX * parentWidth;
  const absoluteY = relativeY * parentHeight;

  return { absoluteX, absoluteY };
}

interface ContextualAnnotationsProps {
  annotations: AnnotationByProjectIdItem[];
  onClick: (annotation: AnnotationByProjectIdItem) => void;
}

type ContextualItemProps = {
  index: number;
  annotation: AnnotationByProjectIdItem;
  x: number;
  y: number;
  onClick: () => void;
};

const ContextualItem: React.FC<ContextualItemProps> = ({
  index,
  annotation,
  onClick,
  x,
  y,
}) => (
  <Paper
    sx={{
      cursor: "pointer",
      pointerEvents: "auto",
      position: "absolute",
      zIndex: 6 + index,
      height: 40,
      width: 40,
      maxHeight: 40,
      maxWidth: 40,
      borderRadius: 40,
      margin: 0,
      padding: 0,
      backgroundColor: "white",
      transition: "all 0.2s ease",
      "&:hover": {
        filter: "brightness(85%)",
      },
      color: "white",
      top: y,
      left: x,

      border: `2px solid ${annotation.user.color}`,
    }}
    style={{
      backgroundColor: annotation.user.color,
    }}
    onClick={onClick}
  />
);

const ContextualAnnotationsContent: React.FC<ContextualAnnotationsProps> = memo(
  ({ annotations, onClick }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { width, height } = useParentSize(ref);
    return (
      <Box
        ref={ref}
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          margin: 0,
          height: "100%",
          width: "100%",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <Box
          display={"flex"}
          flexDirection={"row"}
          paddingX={2}
          paddingY={2}
          justifyContent={"space-between"}
        >
          {width && height ? (
            <Box sx={{ height: "100%", overflow: "auto" }}>
              {annotations.map((annotation, index) => {
                return (
                  <ContextualItem
                    key={annotation.id}
                    x={annotation.extra.relativeX * width}
                    y={annotation.extra.relativeY * height}
                    index={index}
                    annotation={annotation}
                    onClick={() => onClick(annotation)}
                  />
                );
              })}
            </Box>
          ) : null}
        </Box>
      </Box>
    );
  }
);

export const ContextualAnnotations: React.FC<ContextualAnnotationsProps> = memo(
  ({ annotations, onClick }) => {
    const filteredAnnotations = useMemo(
      () =>
        annotations.filter((item) => {
          return (
            typeof item === "object" && Object.keys(item.extra || {}).length
          );
        }),
      [annotations]
    );

    if (filteredAnnotations.length == 0) return null;

    return (
      <ContextualAnnotationsContent
        annotations={filteredAnnotations}
        onClick={onClick}
      />
    );
  }
);
