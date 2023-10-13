import {
  type UseParentSizeOptions,
  useParentSize,
} from "@cutting/use-get-parent-size";
import CancelIcon from "@mui/icons-material/Clear";
import { alpha, Box, Fade, IconButton, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import { AnnotationByProjectIdItem, ProjectById, trpc } from "~utils/trpc";
import { getUserColor } from "~utils/UserUtils";

interface AnnotationHintsProps {
  project: ProjectById;
  annotations: AnnotationByProjectIdItem[];
  onClick: (annotation: AnnotationByProjectIdItem) => void;
  onClose: React.MouseEventHandler<HTMLButtonElement>;
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 300,
    // fontSize: theme.typography.pxToRem(12),
    // border: "1px solid #dadde9",
  },
}));

type AnnotationHintsItemProps = {
  index: number,
  annotation: AnnotationByProjectIdItem,
  leftPosition: string,
  width: number,
  onClick: () => void,
};

const AnnotationHintsItem: React.FC<AnnotationHintsItemProps> = ({
  index,
  annotation,
  onClick,
  leftPosition,
  width,
}) => (
  <HtmlTooltip
    followCursor
    title={
      <React.Fragment>
        <Typography variant="body2">{annotation.user.username}</Typography>
        <Typography
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
          }}
        >
          {annotation.text}
        </Typography>
      </React.Fragment>
    }
  >
    <Paper
      sx={{
        cursor: "pointer",
        pointerEvents: "auto",
        position: "absolute",
        zIndex: 6,
        height: 10,
        minWidth: 10,
        margin: 0,
        padding: 0,
        borderRadius: 2,
        backgroundColor: "white",
        transition: "all 0.2s ease",
        "&:hover": {
          filter: "brightness(85%)",
        },
        color: "white",
        top: 60 + index * 24,
        left: leftPosition,
        width: width,
        border: `2px solid ${getUserColor(annotation.user.id)}`,
      }}
      style={{
        backgroundColor: getUserColor(annotation.user.id),
      }}
      onClick={onClick}
    />
  </HtmlTooltip>
);

export const AnnotationContextuels: React.FC<AnnotationHintsProps> = ({
  project,
  annotations,
  onClick,
  onClose,
}) => {
  const { t } = useTranslation();

  // const ref = useRef<HTMLDivElement>(null);
  // const { width, height } = useParentSize(ref);

  const getHintStartPosition = (annotation: AnnotationByProjectIdItem) =>
    `${(annotation.startTime * 100) / project.duration}%`;
  const getHintWidth = (annotation: AnnotationByProjectIdItem) =>
    `${
      ((annotation.stopTime - annotation.startTime) * 100) / project.duration
    }%`;

  const handleClose: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    onClose(event);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        margin: 0,
        height: "100%",
        width: "100%",
        pointerEvents: "none",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
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
        <Box>
          <Typography align="left" variant="h5" color="white">
            {annotations.length > 0
              ? t("annotation.hintLabel", { count: annotations.length })
              : t("annotation.hintLabelNone")}
          </Typography>
        </Box>

        <Box>
          <IconButton
            onClick={handleClose}
            sx={{ pointerEvents: "auto", color: "white" }}
          >
            <CancelIcon />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ height: "100%", overflow: "auto" }}>
        {annotations
          .flatMap((x) => [x, x, x, x, x, x, x, x])
          .map((annotation, index) => {
            return (
              <AnnotationHintsItem
                id={annotation.id}
                leftPosition={getHintStartPosition(annotation)}
                width={getHintWidth(annotation)}
                index={index}
                annotation={annotation}
                onClick={() => onClick(annotation)}
              />
            );
          })}
      </Box>
    </Box>
  );
};
