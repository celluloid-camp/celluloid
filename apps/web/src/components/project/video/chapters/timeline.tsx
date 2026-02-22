import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  timelineOppositeContentClasses,
} from "@mui/lab";
import { Box, Stack, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MediaActionTypes,
  useMediaDispatch,
} from "media-chrome/react/media-store";
import Image from "mui-image";
import type * as React from "react";
import { useState } from "react";
import type { User } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import type { ChapterByProjectId, ProjectById } from "@/lib/trpc/types";
import { formatDuration } from "@/utils/duration";
import { EditChapterDialog } from "./edit-dialog";
import { EmptyChapters } from "./empty";
import { ChapterItem } from "./list-item";

export function ChapterTimeline({
  chapters,
  user,
  project,
}: {
  chapters: ChapterByProjectId[];
  user?: User;
  project: ProjectById;
}) {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation(api.chapter.delete.mutationOptions());
  const [editingChapter, setEditingChapter] =
    useState<ChapterByProjectId | null>(null);

  const dispatch = useMediaDispatch();

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
    dispatch({
      type: MediaActionTypes.MEDIA_SEEK_REQUEST,
      detail: chapter.startTime as number,
    });
  };

  const handleOpenEditDialog = (chapter: ChapterByProjectId) => {
    setEditingChapter(chapter);
  };

  const handleCloseEditDialog = () => {
    setEditingChapter(null);
  };

  const handleDeleteChapter = async (chapter: ChapterByProjectId) => {
    try {
      await deleteMutation.mutateAsync({
        chapterId: chapter.id,
      });
      queryClient.invalidateQueries(
        api.chapter.byProjectId.queryFilter({ projectId: project.id }),
      );
    } catch {
      queryClient.invalidateQueries(
        api.chapter.byProjectId.queryFilter({ projectId: project.id }),
      );
    }
  };

  return (
    <>
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
                src={chapter.thumbnailUrl ?? "/placeholder.svg"}
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
                onEditChapter={handleOpenEditDialog}
                onDeleteChapter={handleDeleteChapter}
              />
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      <EditChapterDialog
        project={project}
        chapter={editingChapter}
        open={Boolean(editingChapter)}
        onClose={handleCloseEditDialog}
      />
    </>
  );
}
