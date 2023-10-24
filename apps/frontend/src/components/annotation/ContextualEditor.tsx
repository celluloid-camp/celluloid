import { useParentSize } from "@cutting/use-get-parent-size";
import { Box, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/system";
import React, { useRef } from "react";
import Draggable, {
  DraggableData,
  DraggableEvent,
  DraggableEventHandler,
} from "react-draggable";
import { useTranslation } from "react-i18next";

import { useContextualEditorPosition } from "./useAnnotationEditor";

type ContextualEditorProps = {};

function toRelativePosition(
  x: number,
  y: number,
  parentWidth: number,
  parentHeight: number
) {
  const relativeX = x / parentWidth;
  const relativeY = y / parentHeight;

  return { relativeX, relativeY, x, y, parentWidth, parentHeight };
}

export const ContextualEditor: React.FC<ContextualEditorProps> = () => {
  const { t } = useTranslation();

  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useParentSize(ref);
  const nodeRef = React.useRef(null);

  const [contextualEditorState, setContextualEditorState] =
    useContextualEditorPosition();

  const handleDrag = (_: DraggableEvent, data: DraggableData) => {
    if (width && height) {
      const position = toRelativePosition(data.x, data.y, width, height);

      setContextualEditorState(position);
    }
  };

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
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
          <line x1="10" y1="0" x2="10" y2="20" stroke="gray" stroke-opacity="0.3" stroke-width="1" />
          <line x1="0" y1="10" x2="20" y2="10" stroke="gray" stroke-opacity="0.3" stroke-width="1" />
          </svg>`
        )}")`,
        backgroundRepeat: "repeat",
        overflow: "hidden",
      }}
    >
      <Box sx={{ height: height, width: width, overflow: "hidden" }}>
        <Draggable
          defaultPosition={{
            x: contextualEditorState?.x || 0,
            y: contextualEditorState?.y || 0,
          }}
          nodeRef={nodeRef}
          grid={[10, 10]}
          onStop={handleDrag}
          bounds="parent"
        >
          <Paper
            ref={nodeRef}
            sx={{
              cursor: "move",
              height: 40,
              width: 40,
              maxHeight: 40,
              maxWidth: 40,
              borderRadius: 40,
              borderColor: "secondary.main",
              borderWidth: 2,
              borderStyle: "dashed",
              backgroundColor: (theme) =>
                alpha(theme.palette.secondary.main, 0.5),
              margin: 0,
              padding: 0,
              color: "white",
            }}
          />
        </Draggable>
      </Box>
    </Box>
  );
};
