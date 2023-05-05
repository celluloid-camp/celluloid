import { AnnotationRecord } from "@celluloid/types";
import CancelIcon from "@mui/icons-material/Clear";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { getUserColor } from "~utils/UserUtils";

interface Props {
  duration: number;
  position: number;
  annotations: AnnotationRecord[];
  visible: boolean;
  onClick: (annotation: AnnotationRecord) => void;
  onClose: React.MouseEventHandler<HTMLButtonElement>;
}

const AnnotationHints: React.FC<Props> = ({
  duration,
  annotations,
  visible,
  onClick,
  onClose,
}) => {
  const { t } = useTranslation();

  const getHintStartPosition = (annotation: AnnotationRecord) =>
    `${(annotation.startTime * 100) / duration}%`;
  const getHintWidth = (annotation: AnnotationRecord) =>
    `${((annotation.stopTime - annotation.startTime) * 100) / duration}%`;

  const handleClose: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    onClose(event);
  };
  return (
    <Box
      sx={(theme) => ({
        position: "relative",
        left: 0,
        top: 0,
        margin: 0,
        height: `calc(100% - ${theme.spacing(6)}px)`,
        width: `100%`,
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
              visible: visible ? "visible" : "hidden",
              color: "white",
              top: visible ? 60 + index * 24 : 0,
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
  );
};

export default AnnotationHints;
