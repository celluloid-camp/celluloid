import { useParentSize } from "@cutting/use-get-parent-size";
import { Box, Paper } from "@mui/material";
import React, { memo, useMemo, useRef } from "react";

import { AnnotationByProjectIdItem } from "~utils/trpc";

interface ContextualAnnotationsProps {
  annotations: AnnotationByProjectIdItem[];
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
  ({ annotations }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { width, height } = useParentSize(ref);

    const handleFocus = (_: AnnotationByProjectIdItem) => {};

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
                    onClick={() => handleFocus(annotation)}
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
  ({ annotations }) => {
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

    return <ContextualAnnotationsContent annotations={filteredAnnotations} />;
  }
);
