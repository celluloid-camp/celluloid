import CancelIcon from "@mui/icons-material/Clear";
import { alpha, Box, Fade, IconButton, Paper, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { AnnotationByProjectIdItem, ProjectById, trpc } from "~utils/trpc";
import { getUserColor } from "~utils/UserUtils";

interface AnnotationHintsProps {
  project: ProjectById;
  annotations: AnnotationByProjectIdItem[];
  onClick: (annotation: AnnotationByProjectIdItem) => void;
  onClose: React.MouseEventHandler<HTMLButtonElement>;
}

export const AnnotationHints: React.FC<AnnotationHintsProps> = ({
  project,
  annotations,
  onClick,
  onClose,
}) => {
  const { t } = useTranslation();

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
    <Fade in={true}>
      <Box
        sx={(theme) => ({
          position: "relative",
          left: 0,
          top: 0,
          margin: 0,
          height: `100%`,
          width: `100%`,
          backgroundColor: alpha("#000000", 0.1),
        })}
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
            <IconButton color="secondary" onClick={handleClose}>
              <CancelIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        {annotations.map((annotation, index) => {
          return (
            <Paper
              key={annotation.id}
              sx={{
                cursor: "pointer",
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
                left: getHintStartPosition(annotation),
                width: getHintWidth(annotation),
                border: `2px solid ${getUserColor(annotation.user.id)}`,
              }}
              style={{
                backgroundColor: getUserColor(annotation.user.id),
              }}
              onClick={() => onClick(annotation)}
            />
          );
        })}
      </Box>
    </Fade>
  );
};
