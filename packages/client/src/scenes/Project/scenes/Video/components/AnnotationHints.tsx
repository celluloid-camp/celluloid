import { AnnotationRecord } from "@celluloid/types";
import CancelIcon from "@mui/icons-material/Clear";
import { Box, Grid, IconButton, Paper, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { getUserColor } from "utils/UserUtils";

// const styles = (theme: Theme) =>
//   createStyles({
//     visible: {
//       opacity: 1,
//     },
//     hidden: {
//       opacity: 0,
//     },
//     hint: {
//       cursor: "pointer",
//       position: "absolute",
//       zIndex: 6,
//       height: 10,
//       minWidth: 10,
//       margin: 0,
//       padding: 0,
//       borderRadius: 2,
//       backgroundColor: "white",
//       transition: "all 0.2s ease",
//       "&:hover": {
//         filter: "brightness(85%)",
//       },
//     },
//     container: {
//       position: "relative",
//       margin: 24,
//       height: `calc(100% - ${theme.spacing.unit * 6}px)`,
//       width: `calc(100% - ${theme.spacing.unit * 6}px)`,
//     },
//     title: {
//       color: theme.palette.text.disabled,
//       top: 0,
//       left: 0,
//     },
//   });

interface Props {
  duration: number;
  position: number;
  annotations: AnnotationRecord[];
  visible: boolean;
  onClick: Function;
  onClose: Function;
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

  const handleClose = (event: any) => {
    event.stopPropagation();
    onClose();
  };
  return (
    <Box
      sx={(theme) => ({
        position: "relative",
        margin: 24,
        height: `calc(100% - ${theme.spacing(6)}px)`,
        width: `calc(100% - ${theme.spacing(6)}px)`,
      })}
    >
      <Grid
        container
        // direction="row"
        // justify="space-between"
        // alignItems="center"
        // spacing={24}
      >
        <Grid item>
          <Typography align="left" variant="h5">
            {annotations.length > 0
              ? t("annotation.hintLabel", { count: annotations.length })
              : t("annotation.hintLabelNone")}
          </Typography>
        </Grid>

        <Grid item>
          <IconButton color="secondary" onClick={handleClose}>
            <CancelIcon fontSize="small" />
          </IconButton>
        </Grid>
      </Grid>
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
              opacity: visible ? 1 : 0,
            }}
            // className={classNames(
            //   classes.hint,
            //   visible ? classes.visible : classes.hidden
            // )}
            style={{
              color: "white",
              top: visible ? 48 + index * 24 : 0,
              left: getHintStartPosition(annotation),
              width: getHintWidth(annotation),
              backgroundColor: getUserColor(annotation.user),
              border: `2px solid ${getUserColor(annotation.user)}`,
            }}
            onClick={() => onClick(annotation)}
          />
        );
      })}
    </Box>
  );
};

export default AnnotationHints;
