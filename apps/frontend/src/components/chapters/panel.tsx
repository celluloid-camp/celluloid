import InfoIcon from "@mui/icons-material/Info";
import { Button, Grow, List, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import type * as React from "react";
import { Trans, useTranslation } from "react-i18next";
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
import { useSnackbar } from "notistack";
import type ReactPlayer from "@celluloid/react-player";
import { useVideoPlayerSeekEvent } from "~hooks/use-video-player";

function ChapterList({
  chapters,
  user,
  project,
}: {
  chapters: ChapterByProjectId[];
  user?: UserMe;
  project: ProjectById;
}) {
  const dispatcher = useVideoPlayerSeekEvent();

  if (chapters.length === 0) {
    return <EmptyChapter />;
  }

  const handleClick = (chapter: ChapterByProjectId) => {
    console.log(chapter);
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
              fit="contain"
              width={120}
              height={80}
              style={{
                borderRadius: 10,
                overflow: "hidden",
                cursor: "pointer",
              }}
              src={chapter.thumbnail?.publicUrl ?? ""}
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
              index={index}
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
  // return <div>{JSON.stringify(project)}</div>;

  if (!project.chapterJob) {
    return <NoChaptersJob projectId={project.id} />;
  }

  if (!project.chapterJob?.finishedAt) {
    return <ChaptersInProgress project={project} />;
  }
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

function EmptyChapter() {
  return (
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
          <Trans i18nKey="project.chapters.empty" />
        </Typography>
      </Stack>
    </Grow>
  );
}

function NoChaptersJob({ projectId }: { projectId: string }) {
  const mutation = trpc.chapter.generateChapters.useMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const handleGenerate = async () => {
    await mutation.mutateAsync({ projectId: projectId });

    enqueueSnackbar(t("confirm.generation.sent", "Génération envoyée"), {
      variant: "success",
    });

    utils.project.byId.invalidate({ id: projectId });
  };
  return (
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
          margin: 2,
        }}
      >
        <InfoIcon sx={{ fontSize: 30, color: "gray" }} />
        <Typography variant="body2" color="gray" textAlign={"center"}>
          Generate chapters
        </Typography>
        <Button variant="contained" color="primary" onClick={handleGenerate}>
          Generate
        </Button>
      </Stack>
    </Grow>
  );
}

function ChaptersInProgress({ project }: { project: ProjectById }) {
  const { t } = useTranslation();
  return (
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
          margin: 2,
        }}
      >
        <InfoIcon sx={{ fontSize: 30, color: "gray" }} />
        <Typography variant="body2" color="gray" textAlign={"center"}>
          {t(
            "project.chapters.inProgress.description",
            "La génération est en cours"
          )}
        </Typography>
      </Stack>
    </Grow>
  );
}
