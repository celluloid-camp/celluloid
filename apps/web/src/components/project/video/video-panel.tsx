"use client";
import { useParentSize } from "@cutting/use-get-parent-size";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import SpeakerNotesIcon from "@mui/icons-material/SpeakerNotes";
import TheatersIcon from "@mui/icons-material/Theaters";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Badge, Box, Paper, Tab } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useTranslations } from "next-intl";
import type * as React from "react";
import { useMemo, useRef, useState } from "react";
import type { User } from "@/lib/auth-client";
import type { AnnotationByProjectId, ProjectById } from "@/lib/trpc/types";
import { AnnotationList } from "./annotation/annotation-list";
import { ScenesPanel } from "./chapters/panel";

const TABLIST_HEIGHT = 60;
interface VideoPanelProps {
  project: ProjectById;
  annotations: AnnotationByProjectId[];
  annotationCount: number;
  user?: User;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({
  annotationCount,
  ...props
}) => {
  const [value, setValue] = useState("1");

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const t = useTranslations();

  const ref = useRef<HTMLDivElement>(null);
  const { height } = useParentSize(ref);

  const availableHeight = useMemo(
    () => (height ? height - TABLIST_HEIGHT - 12 : "100%"),
    [height],
  );

  return (
    <Paper
      ref={ref}
      sx={{
        backgroundColor: { md: "background.dark", xs: "transparent" },
        overflow: "hidden",
        height: "100%",
      }}
    >
      <TabContext value={value}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: grey[800],
            position: "relative",
            display: { xs: "none", md: "block" },
          }}
        >
          <TabList
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            sx={{ height: TABLIST_HEIGHT, px: 2 }}
          >
            <Tab
              icon={<SpeakerNotesIcon />}
              iconPosition="start"
              label={
                <Box className="flex items-center gap-4">
                  {t("project.annotation.title")}
                  <Badge
                    badgeContent={annotationCount}
                    color="secondary"
                    showZero={true}
                  />
                </Box>
              }
              value="1"
            />
            <Tab
              icon={<TheatersIcon />}
              iconPosition="start"
              label={t("project.scenes.title")}
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: availableHeight,
            }}
          >
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: availableHeight,
            }}
          >
            <ScenesPanel project={props.project} user={props.user} />
          </Box>
        </TabPanel>
      </TabContext>
    </Paper>
  );
};
