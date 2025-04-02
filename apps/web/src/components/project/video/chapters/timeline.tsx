import { Box, Stack, Typography } from "@mui/material";
import type * as React from "react";
import Image from "mui-image";
import type { ChapterByProjectId, ProjectById } from "@/lib/trpc/types";

import { ChapterItem } from "./list-item";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  timelineOppositeContentClasses,
  TimelineSeparator,
} from "@mui/lab";
import { formatDuration } from "@/utils/duration";
import { useVideoPlayerSeekEvent } from "@/hooks/use-video-player";
import type { User } from "@/lib/auth-client";
import { EmptyChapters } from "./empty";

export function ChapterTimeline({
  chapters,
  user,
  project,
}: {
  chapters: ChapterByProjectId[];
  user?: User;
  project: ProjectById;
}) {
  const dispatcher = useVideoPlayerSeekEvent();

  if (chapters.length === 0) {
    return (
      <Box
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <EmptyChapters />
      </Box>
    );
  }

  const handleClick = (chapter: ChapterByProjectId) => {
    dispatcher({
      time: chapter.startTime,
    });
  };

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
      {chapters.map((chapter: ChapterByProjectId, index: number) => (
        <TimelineItem key={chapter.id} sx={{ minHeight: 120 }}>
          <TimelineOppositeContent onClick={() => handleClick(chapter)}>
            <Image
              fit="cover"
              width={120}
              height={80}
              style={{
                borderRadius: 10,
                overflow: "hidden",
                cursor: "pointer",
              }}
              src={chapter.thumbnail?.publicUrl ?? "/placeholder.svg"}
            />
            <Stack direction="row" spacing={1}>
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="caption"
                color="gray"
              >
                #{index + 1}
              </Typography>
              <Typography
                sx={{ display: "inline", flex: 1 }}
                component="span"
                variant="caption"
                color="gray"
              >
                {formatDuration(chapter.startTime)}
                {" → "}
                {formatDuration(chapter.endTime)}
              </Typography>
            </Stack>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot
              variant="outlined"
              sx={{ borderWidth: 2, borderColor: "grey.800" }}
            />
            <TimelineConnector sx={{ backgroundColor: "grey.800" }} />
          </TimelineSeparator>
          <TimelineContent>
            <ChapterItem
              chapter={chapter}
              key={chapter.id}
              user={user}
              project={project}
              index={index}
            />
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
