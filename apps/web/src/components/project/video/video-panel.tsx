"use client";
import { useParentSize } from "@cutting/use-get-parent-size";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import SpeakerNotesIcon from "@mui/icons-material/SpeakerNotes";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Badge, Box, Fab, Paper, Tab, Tooltip } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useTranslations } from "next-intl";
import type * as React from "react";
import { useMemo, useRef, useState } from "react";
import type { User } from "@/lib/auth-client";
import type { AnnotationByProjectId, ProjectById } from "@/lib/trpc/types";
import { AnnotationList } from "./annotation/annotation-list";
import { useAnnotationHintsVisible } from "./annotation/useAnnotationEditor";
import { ChaptersPanel } from "./chapters/panel";

const TABLIST_HEIGHT = 60;
interface VideoPanelProps {
  project: ProjectById;
  annotations: AnnotationByProjectId[];
  annotationCount: number;
  playerIsReady: boolean;
  user?: User;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({
  annotationCount,
  playerIsReady,
  ...props
}) => {
  const [value, setValue] = useState("1");

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const t = useTranslations();

  const ref = useRef<HTMLDivElement>(null);
  const { height } = useParentSize(ref);

  const [hintsVisible, setHintsVisible] = useAnnotationHintsVisible();

  const availableHeight = useMemo(
    () => (height ? height - TABLIST_HEIGHT - 12 : "100%"),
    [height],
  );

  return (
    <Paper
      ref={ref}
      sx={{
        position: "relative",
        backgroundColor: "background.dark",
        overflow: "hidden",
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
          <Box position={"absolute"} right={0} top={14}>
            <Tooltip title={t("project.annotation.hints.label")}>
              <Fab
                color="secondary"
                size="small"
                onClick={() => setHintsVisible(!hintsVisible)}
              >
                <ViewTimelineIcon />
              </Fab>
            </Tooltip>
          </Box>

          <TabList
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            sx={{ height: TABLIST_HEIGHT }}
          >
            <Tab
              icon={
                <Badge badgeContent={annotationCount} color="secondary">
                  <SpeakerNotesIcon />
                </Badge>
              }
              iconPosition="start"
              label={t("project.annotation.title")}
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
          }}
        >
          <Box display="flex" flexDirection={"column"} height={availableHeight}>
            <AnnotationList user={props.user} {...props} />
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
          <Box display="flex" flexDirection={"column"} height={availableHeight}>
            <ChaptersPanel project={props.project} user={props.user} />
          </Box>
        </TabPanel>
      </TabContext>
    </Paper>
  );
};
