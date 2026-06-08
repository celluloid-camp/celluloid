import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from "@mui/lab/TimelineOppositeContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useMutation } from "@tanstack/react-query";
import {
  MediaActionTypes,
  useMediaDispatch,
} from "media-chrome/react/media-store";
import type * as React from "react";
import { useState } from "react";
import { ImageSprite } from "@/components/common/image-sprite";
import type { User } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import type { ChapterByProjectId, ProjectById } from "@/lib/trpc/types";
import { formatDuration } from "@/utils/duration";
import { EditChapterDialog } from "./edit-dialog";
import { EmptyChapters } from "./empty";
import { ChapterItem } from "./list-item";

export function ChapterTimeline({
  chapters,
  project,
}: {
  chapters: ChapterByProjectId[];
  project: ProjectById;
}) {
  const api = useTRPC();
  const deleteMutation = useMutation(api.chapter.delete.mutationOptions());
  const [editingChapter, setEditingChapter] =
    useState<ChapterByProjectId | null>(null);

  const dispatch = useMediaDispatch();

  if (chapters.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
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
    } catch {
      console.error("Failed to delete chapter");
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
        className="no-scrollbar"
      >
        {chapters.map((chapter: ChapterByProjectId, index: number) => (
          <TimelineItem key={chapter.id} sx={{ minHeight: 120 }}>
            <TimelineOppositeContent onClick={() => handleClick(chapter)}>
              <ImageSprite
                src={chapter.spriteURL ?? ""}
                width={120}
                height={80}
                className="cursor-pointer rounded-[10px]"
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
                canEdit={project.editable}
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
