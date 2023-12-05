import CancelIcon from "@mui/icons-material/Clear";
import { Box, Fade, IconButton, Paper, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import React from "react";
import { useTranslation } from "react-i18next";

import { Avatar } from "~components/Avatar";
import { MultiLineTypography } from "~components/MultiLineTypography";
import { AnnotationByProjectId, ProjectById } from "~utils/trpc";
import { getUserColor } from "~utils/UserUtils";

import { useAnnotationHintsVisible } from "./useAnnotationEditor";

interface AnnotationHintsProps {
  project: ProjectById;
  annotations: AnnotationByProjectId[];
  onClick: (annotation: AnnotationByProjectId) => void;
}

export const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    color: "#f5f5f9",
    maxWidth: 300,
    minWidth: 150,
    backgroundColor: grey[900],
    borderColor: grey[800],
    borderWidth: 1,
    borderStyle: "solid",
  },
}));

type AnnotationHintsItemProps = {
  index: number;
  annotation: AnnotationByProjectId;
  leftPosition: string;
  width: number;
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
      sx={{
        cursor: "pointer",
        position: "absolute",
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
        top: index * 24,
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

export const AnnotationHints: React.FC<AnnotationHintsProps> = ({
  project,
  annotations,
  onClick,
}) => {
  const { t } = useTranslation();

  // const ref = useRef<HTMLDivElement>(null);
  // const { width, height } = useParentSize(ref);

  const [_, setHintsVisible] = useAnnotationHintsVisible();

  const getHintStartPosition = (annotation: AnnotationByProjectId) =>
    `${(annotation.startTime * 100) / project.duration}%`;
  const getHintWidth = (annotation: AnnotationByProjectId) =>
    `${
      ((annotation.stopTime - annotation.startTime) * 100) / project.duration
    }%`;

  const handleClose: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    setHintsVisible(false);
  };

  const handleClick = (annotation) => {
    onClick(annotation);
    setHintsVisible(false);
  };

  return (
    <Fade in={true}>
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          margin: 0,
          height: "100%",
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          overflow: "hidden",
        }}
      >
        <Box
          display={"flex"}
          flexDirection={"row"}
          paddingX={2}
          paddingY={2}
          justifyContent={"space-between"}
          sx={{ backgroundColor: "black" }}
        >
          <Box>
            <Typography align="left" variant="h5" color="white">
              {annotations.length > 0
                ? t("annotation.hintLabel", { count: annotations.length })
                : t("annotation.hintLabelNone")}
            </Typography>
          </Box>

          <Box>
            <IconButton onClick={handleClose} sx={{ color: "white" }}>
              <CancelIcon />
            </IconButton>
          </Box>
        </Box>
        <Box
          sx={{
            position: "relative",
            height: "100%",
            width: "100%",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
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
        </Box>
      </Box>
    </Fade>
  );
};
