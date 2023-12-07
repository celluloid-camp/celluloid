import { useParentSize } from "@cutting/use-get-parent-size";
import { Avatar, Box, hexToRgb, Paper, Stack, Typography } from "@mui/material";
import React, { memo, useMemo, useRef } from "react";

import { MultiLineTypography } from "~components/MultiLineTypography";
import { AnnotationByProjectId } from "~utils/trpc";

import { HtmlTooltip } from "./AnnotationHints";

interface ContextualAnnotationsProps {
  annotations: AnnotationByProjectId[];
}

type ContextualItemProps = {
  index: number;
  annotation: AnnotationByProjectId;
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
  <HtmlTooltip
    arrow
    title={
      <React.Fragment>
        <Stack sx={{ py: 1 }} spacing={1}>
          <Box>
            <Stack direction={"row"} spacing={1} alignItems={"center"}>
              <Avatar
                sx={{
                  background: annotation.user.color,
                  width: 24,
                  height: 24,
                  borderWidth: 2,
                  borderColor: annotation.user.color,
                  borderStyle: "solid",
                }}
                src={annotation.user.avatar?.publicUrl}
              >
                {annotation.user.initial}
              </Avatar>
              <Stack>
                <Typography component="span" color="white" variant="body2">
                  {annotation.user.username}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <MultiLineTypography
            variant="caption"
            color="gray"
            lineLimit={1}
            text={annotation.text}
          />
        </Stack>
      </React.Fragment>
    }
  >
    <Paper
      elevation={2}
      sx={{
        cursor: "pointer",
        pointerEvents: "auto",
        position: "absolute",
        zIndex: 6 + index,
        height: 25,
        width: 25,
        maxHeight: 25,
        maxWidth: 25,
        borderRadius: 25,
        margin: 0,
        padding: 0,
        "&:hover": {
          filter: "brightness(85%)",
        },
        color: "white",
        top: y,
        left: x,
        border: `2px solid ${annotation.user.color}`,
        backgroundColor: `${annotation.user.color}`,
      }}
      onClick={onClick}
    />
  </HtmlTooltip>
);

const ContextualAnnotationsContent: React.FC<ContextualAnnotationsProps> = memo(
  ({ annotations }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { width, height } = useParentSize(ref);

    const handleFocus = (_: AnnotationByProjectId) => {};

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
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          userSelect: "none",
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
