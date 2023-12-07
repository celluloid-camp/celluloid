import { useParentSize } from "@cutting/use-get-parent-size";
import InfoIcon from "@mui/icons-material/Info";
import SpeakerNotesIcon from "@mui/icons-material/SpeakerNotes";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import {
  Badge,
  BadgeProps,
  Box,
  Fab,
  Grow,
  List,
  Paper,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { AnnotationByProjectId, ProjectById, UserMe } from "~utils/trpc";

import { AnnotationForm } from "./AnnotationForm";
import { AnnotationItem } from "./AnnotationItem";
import { useAnnotationHintsVisible } from "./useAnnotationEditor";

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.dark}`,
    padding: "0 4px",
  },
}));

const EmptyAnnotation = () => (
  <Grow in={true}>
    <Stack
      spacing={1}
      alignContent={"center"}
      alignItems={"center"}
      sx={{
        paddingY: 5,
        paddingX: 5,
        borderRadius: 1,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: grey[800],
        marginBottom: 1,
      }}
    >
      <InfoIcon sx={{ fontSize: 30, color: "gray" }} />
      <Typography variant="body2" color="gray" textAlign={"center"}>
        <Trans i18nKey="project.annotaions.empty" />
      </Typography>
    </Stack>
  </Grow>
);

interface AnnotationPanelProps {
  project: ProjectById;
  user?: UserMe;
  annotations: AnnotationByProjectId[];
  annotationCount: number;
  playerIsReady: boolean;
}

const AnnotationList: React.FC<
  Omit<AnnotationPanelProps, "annotationCount" | "onShowHintsClick">
> = ({ project, annotations = [], user, playerIsReady }) => {
  const containerRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);

  const [listHeight, setListHeight] = useState<number | "auto">("auto");

  const updateListHeight = () => {
    if (containerRef.current && formRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const formHeight = formRef.current.offsetHeight + 20;
      setListHeight(containerHeight - formHeight);
    }
  };

  useEffect(() => {
    updateListHeight();
  }, [playerIsReady]);

  useEffect(() => {
    // Initial calculation
    updateListHeight();

    // Listen to resize events
    const resizeObserver = new ResizeObserver(() => {
      updateListHeight();
    });

    if (formRef.current) {
      resizeObserver.observe(formRef.current);
    }

    return () => {
      if (formRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        resizeObserver.unobserve(formRef.current);
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <List
        dense={true}
        sx={{
          overflow: "auto",
          paddingX: 2,
          height: `${listHeight}px`,
          maxHeight: `${listHeight}px`,
          // minHeight: 600,
          // maxHeight: 600,
          "& ul": { padding: 0 },
        }}
      >
        {annotations
          // .flatMap((x) => [x, x, x, x, x, x, x, x])
          .map((annotation: AnnotationByProjectId) => (
            <AnnotationItem
              annotation={annotation}
              key={annotation.id}
              user={user}
              project={project}
            />
          ))}

        {annotations.length == 0 && <EmptyAnnotation />}
      </List>

      <Box ref={formRef} display={"flex"} flexDirection={"column"}>
        {project.annotable && playerIsReady && user ? (
          <AnnotationForm
            duration={project.duration}
            project={project}
            user={user}
          />
        ) : null}
      </Box>
    </Box>
  );
};

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  annotationCount,
  playerIsReady,
  ...props
}) => {
  const { t } = useTranslation();

  const ref = useRef<HTMLDivElement>(null);
  const { height } = useParentSize(ref);

  const [hintsVisible, setHintsVisible] = useAnnotationHintsVisible();

  return (
    <Paper
      ref={ref}
      sx={{
        backgroundColor: "background.dark",
        paddingY: 3,
        marginX: 2,
        marginTop: 2,
        height: "95%",
      }}
    >
      <Box display="flex" flexDirection={"column"} height={height}>
        <Box
          display="flex"
          flexDirection={"row"}
          justifyContent="space-between"
          paddingX={3}
          alignContent={"center"}
          alignItems={"center"}
        >
          <Stack direction={"row"}>
            <StyledBadge badgeContent={annotationCount} color="secondary">
              <SpeakerNotesIcon sx={{ color: "white" }} />
            </StyledBadge>
            <Typography
              variant="h6"
              color="white"
              sx={{ pl: annotationCount > 0 ? 2 : 1 }}
            >
              {t("project.annotation.title", "Annotations")}
            </Typography>
          </Stack>
          <Tooltip
            title={t(
              "project.annotation.hints.label",
              "Afficher la chronologie des annotations."
            )}
          >
            <Fab
              color="secondary"
              size="small"
              onClick={() => setHintsVisible(!hintsVisible)}
              disabled={!playerIsReady}
            >
              <ViewTimelineIcon />
            </Fab>
          </Tooltip>
        </Box>

        <AnnotationList playerIsReady={playerIsReady} {...props} />
      </Box>
    </Paper>
  );
};
