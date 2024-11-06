import { useParentSize } from "@cutting/use-get-parent-size";
import InfoIcon from "@mui/icons-material/Info";
import SpeakerNotesIcon from "@mui/icons-material/SpeakerNotes";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import {
  Badge,
  type BadgeProps,
  Box,
  Fab,
  Grow,
  List,
  Paper,
  Stack,
  styled,
  Tab,
  Tooltip,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import type { AnnotationByProjectId, ProjectById, UserMe } from "~utils/trpc";

import { AnnotationForm } from "./AnnotationForm";
import { AnnotationItem } from "./AnnotationItem";
import { useAnnotationHintsVisible } from "./useAnnotationEditor";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { ChaptersPanel } from "~components/chapters/panel";

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
        position: "relative",
      }}
    >
      <List
        dense={true}
        sx={{
          flex: 1,
          overflow: "auto",
          paddingX: 2,
          position: "relative",

          // height: `${listHeight}px`,
          // maxHeight: `${listHeight}px`,
          // minHeight: 600,
          // maxHeight: 600,
          "& ul": { padding: 0 },
        }}
      >
        {annotations.map((annotation: AnnotationByProjectId) => (
          <AnnotationItem
            annotation={annotation}
            key={annotation.id}
            user={user}
            project={project}
          />
        ))}

        {annotations.length === 0 && <EmptyAnnotation />}
      </List>

      <Box display={"flex"} flexDirection={"column"}>
        {project.annotable && user ? (
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
  const [value, setValue] = useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const { t } = useTranslation();

  const ref = useRef<HTMLDivElement>(null);
  const { height } = useParentSize(ref);

  const [hintsVisible, setHintsVisible] = useAnnotationHintsVisible();

  return (
    <Paper
      ref={ref}
      sx={{
        position: "relative",
        backgroundColor: "background.dark",
        height: "100%",
      }}
    >
      <TabContext value={value}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: grey[800],
            marginX: 2,
            position: "relative",
          }}
        >
          <Box position={"absolute"} right={0} top={20}>
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

          <TabList
            onChange={handleChange}
            aria-label="lab API tabs example"
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab
              icon={
                <Badge badgeContent={annotationCount} color="secondary">
                  <SpeakerNotesIcon />
                </Badge>
              }
              iconPosition="start"
              label={t("project.annotation.title", "Annotations")}
              value="1"
            />
            <Tab
              icon={<BookmarksIcon />}
              iconPosition="start"
              label={t("project.chapters.title")}
              value="2"
            />
          </TabList>
        </Box>
        <TabPanel
          value="1"
          sx={{
            height: "100%",
            padding: 0,
            position: "relative",
            paddingBottom: "100px",
          }}
        >
          <Box
            display="flex"
            flexDirection={"column"}
            height={height}
            sx={{
              position: "relative",
              height: "100%",
            }}
          >
            <AnnotationList playerIsReady={playerIsReady} {...props} />
          </Box>
        </TabPanel>
        <TabPanel
          value="2"
          sx={{
            height: "100%",
            padding: 0,
            paddingBottom: "100px",
            position: "relative",
          }}
        >
          <ChaptersPanel project={props.project} user={props.user} />
        </TabPanel>
      </TabContext>
    </Paper>
  );
};
