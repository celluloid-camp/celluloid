import SpeakerNotesIcon from "@mui/icons-material/SpeakerNotes";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import {
  Badge,
  BadgeProps,
  Box,
  Button,
  Grow,
  IconButton,
  List,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import {
  AnnotationByProjectIdItem,
  ProjectById,
  trpc,
  UserMe,
} from "~utils/trpc";

import { AnnotationForm } from "./AnnotationForm";
import { AnnotationItem } from "./AnnotationItem";

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
    <Box
      sx={{
        paddingY: 0.5,
        borderRadius: 1,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: grey[800],
        marginBottom: 1,
      }}
    >
      <Typography variant="body2" color="gray" sx={{ p: 2 }}>
        <Trans i18next="project.annotaions.empty">
          Les annotations correspondant aux différents temps de la vidéo seront
          affichées ici.
        </Trans>
      </Typography>
    </Box>
  </Grow>
);

interface AnnotationPanelProps {
  project: ProjectById;
  user?: UserMe;
  annotations: AnnotationByProjectIdItem[];
  annotationCount: number;
  onShowHintsClick: () => void;
  playerIsReady: boolean;
}

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  project,
  annotations = [],
  annotationCount,
  user,
  onShowHintsClick,
  playerIsReady,
}) => {
  const { t } = useTranslation();

  const containerRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);

  const [listHeight, setListHeight] = useState<number | "auto">("auto");

  const updateListHeight = () => {
    if (containerRef.current && formRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const formHeight = formRef.current.offsetHeight;
      setListHeight(containerHeight - formHeight);
    }
  };

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
      display="flex"
      flexDirection={"column"}
      sx={{
        backgroundColor: "background.dark",
        paddingY: 3,
        marginX: 2,
        borderRadius: 2,
        height: "100%",
      }}
    >
      <Box display="flex" flexDirection={"column"} height={"100%"}>
        <Box
          display="flex"
          flexDirection={"row"}
          justifyContent="space-between"
          paddingX={2}
        >
          <Stack direction={"row"}>
            <StyledBadge badgeContent={annotationCount} color="secondary">
              <SpeakerNotesIcon sx={{ color: "white" }} />
            </StyledBadge>
            <Typography variant="h6" color="white" sx={{ pl: 2 }}>
              {t("project.annotation.title", "Annotations")}
            </Typography>
          </Stack>
          {playerIsReady && (
            <Button
              variant="contained"
              color="secondary"
              sx={{
                borderRadius: "50%",
                minWidth: "auto",
                padding: "10px",
              }}
              onClick={() => onShowHintsClick()}
            >
              <ViewTimelineIcon />
            </Button>
          )}
        </Box>
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
              flexGrow: 1,
              overflow: "auto",
              paddingX: 2,
              height: `${listHeight}px`,
              // minHeight: 600,
              // maxHeight: 600,
              "& ul": { padding: 0 },
            }}
          >
            {annotations
              // .flatMap((x) => [x, x, x, x, x, x, x, x])
              .map((annotation: AnnotationByProjectIdItem) => (
                <AnnotationItem
                  annotation={annotation}
                  key={annotation.id}
                  user={user}
                  project={project}
                />
              ))}

            {annotations.length == 0 && <EmptyAnnotation />}
          </List>

          <AnnotationForm
            duration={project.duration}
            ref={formRef}
            project={project}
            user={user}
          />
        </Box>
      </Box>
    </Box>
  );
};
