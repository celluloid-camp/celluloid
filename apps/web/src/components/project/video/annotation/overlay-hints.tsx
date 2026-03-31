import CancelIcon from "@mui/icons-material/Clear";
import { Box, Fade, IconButton, Paper, Stack, Typography } from "@mui/material";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import { useTranslations } from "next-intl";
import React from "react";
import { Avatar } from "@/components/common/avatar";
import { MultiLineTypography } from "@/components/common/multiline-typography";
import type { AnnotationByProjectId, ProjectById } from "@/lib/trpc/types";
import { useAnnotations } from "@/stores/annotations";
import { HtmlTooltip } from "./html-tooltip";
import { useAnnotationHintsVisible } from "./useAnnotationEditor";

interface AnnotationHintsProps {
  project: ProjectById;
  annotations: AnnotationByProjectId[];
}

type AnnotationHintsItemProps = {
  index: number;
  annotation: AnnotationByProjectId;
  leftPosition: string;
  width: string;
  onClick: () => void;
};

const AnnotationHintsItem: React.FC<AnnotationHintsItemProps> = ({
  index,
  annotation,
  onClick,
  leftPosition,
  width,
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
                className="text-sm"
                src={annotation.user.image ?? undefined}
              >
                {annotation.user.initial}
              </Avatar>
              <Stack>
                <Typography
                  component="span"
                  className="text-white"
                  variant="body2"
                >
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
      sx={{
        cursor: "pointer",
        position: "absolute",
        height: 10,
        minWidth: 10,
        margin: 0,
        padding: 0,
        borderRadius: 4,
        backgroundColor: "white",
        transition: "all 0.2s ease",
        "&:hover": {
          filter: "brightness(85%)",
        },
        color: "white",
        top: index * 20,
        left: leftPosition,
        width: width,
        border: `2px solid ${annotation.user.color}`,
      }}
      style={{
        backgroundColor: annotation.user.color ?? undefined,
      }}
      onClick={onClick}
    />
  </HtmlTooltip>
);

export function AnnotationOverlayHints({ project }: { project: ProjectById }) {
  const { annotations } = useAnnotations(project.id);
  const t = useTranslations();
  const dispatch = useMediaDispatch();

  const [showHints, setHintsVisible] = useAnnotationHintsVisible();

  const isContextualAnnotation = (annotation: AnnotationByProjectId) =>
    annotation.extra !== null && annotation.extra !== undefined;

  const getHintStartPosition = (annotation: AnnotationByProjectId) => {
    const position = `${(annotation.startTime * 100) / project.duration}%`;
    // Contextual annotations are rendered as dots, centered on their timestamp.
    if (isContextualAnnotation(annotation)) {
      return `calc(${position} - 5px)`;
    }
    return position;
  };

  const getHintWidth = (annotation: AnnotationByProjectId) => {
    if (isContextualAnnotation(annotation)) {
      return "10px";
    }
    return `${((annotation.stopTime - annotation.startTime) * 100) / project.duration}%`;
  };

  const handleClose: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    setHintsVisible(false);
  };

  const handleClick = (annotation: AnnotationByProjectId) => {
    dispatch({
      type: MediaActionTypes.MEDIA_SEEK_REQUEST,
      detail: annotation.startTime,
    });

    setHintsVisible(false);
  };

  if (annotations.length === 0) {
    return null;
  }

  if (!showHints) {
    return null;
  }
  return (
    <Fade in={true}>
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 60,
          margin: 0,
          height: "calc(100% - 60px)",
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          overflow: "hidden",
          zIndex: 1000,
        }}
      >
        <div className="flex flex-row justify-between px-6 pt-4">
          <div>
            <p className="text-white text-lg font-bold">
              {t("project.annotation.label", {
                count: annotations.length,
              })}
            </p>
          </div>

          <div>
            <IconButton onClick={handleClose} className="text-white">
              <CancelIcon />
            </IconButton>
          </div>
        </div>
        <div className="h-full w-full overflow-x-hidden overflow-y-auto px-6">
          <div className="relative h-full w-full">
            {annotations.map((annotation, index) => {
              return (
                <AnnotationHintsItem
                  key={annotation.id}
                  leftPosition={getHintStartPosition(annotation)}
                  width={getHintWidth(annotation)}
                  index={index}
                  annotation={annotation}
                  onClick={() => handleClick(annotation)}
                />
              );
            })}
          </div>
        </div>
      </Box>
    </Fade>
  );
}
