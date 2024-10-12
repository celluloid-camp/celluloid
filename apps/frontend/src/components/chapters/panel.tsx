import InfoIcon from "@mui/icons-material/Info";
import { Grow, List, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import type * as React from "react";
import { Trans } from "react-i18next";
import Image from "mui-image";
import {
  trpc,
  type ChapterByProjectId,
  type ProjectById,
  type UserMe,
} from "~utils/trpc";

import { ChapterItem } from "./list-item";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineOppositeContent,
  timelineOppositeContentClasses,
  TimelineSeparator,
} from "@mui/lab";
import { formatDuration } from "~utils/DurationUtils";

const EmptyChapters = () => (
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

function ChapterList({
  chapters,
  user,
  project,
}: {
  chapters: ChapterByProjectId[];
  user?: UserMe;
  project: ProjectById;
}) {
  //   <List
  //   dense={true}
  //   sx={{
  //     position: "relative",
  //     overflow: "auto",
  //     height: "100%",
  //     paddingRight: 2,
  //   }}
  // >
  //   {chapters.map((chapter: ChapterByProjectId) => (
  //     <ChapterItem
  //       chapter={chapter}
  //       key={chapter.id}
  //       user={user}
  //       project={project}
  //     />
  //   ))}

  //   {chapters.length === 0 && <EmptyChapters />}
  // </List>
  return (
    <Timeline
      sx={{
        position: "relative",
        height: "100%",
        overflow: "auto",
        [`& .${timelineOppositeContentClasses.root}`]: {
          flex: 0,
        },
      }}
    >
      {chapters.map((chapter: ChapterByProjectId) => (
        <TimelineItem key={chapter.id} sx={{ minHeight: 120 }}>
          <TimelineOppositeContent>
            <Image
              fit="contain"
              width={120}
              height={80}
              style={{
                borderRadius: 10,
                overflow: "hidden",
              }}
              src={chapter.thumbnail?.publicUrl ?? ""}
            />
            <Typography
              sx={{ display: "inline" }}
              component="span"
              variant="caption"
              color="gray"
            >
              {formatDuration(chapter.startTime)}
              {" → "}
              {formatDuration(chapter.endTime)}
            </Typography>
          </TimelineOppositeContent>
          <TimelineSeparator sx={{ borderWidth: 1, borderColor: "gray" }}>
            <TimelineDot
              variant="outlined"
              sx={{ borderWidth: 1, borderColor: "gray" }}
            />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <ChapterItem
              chapter={chapter}
              key={chapter.id}
              user={user}
              project={project}
            />
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

interface ChaptersPanelProps {
  project: ProjectById;
  user?: UserMe;
}

export function ChaptersPanel({ project, user }: ChaptersPanelProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div>Error: {error.message}</div>
      )}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ChaptersPanelContent project={project} user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}

export function ChaptersPanelContent({ project, user }: ChaptersPanelProps) {
  const [chapters] = trpc.chapter.byProjectId.useSuspenseQuery({
    projectId: project.id,
  });

  return <ChapterList project={project} user={user} chapters={chapters} />;
}
