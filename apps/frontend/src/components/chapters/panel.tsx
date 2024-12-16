import InfoIcon from "@mui/icons-material/Info";
import { Button, Grow, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import type * as React from "react";
import { useTranslation } from "react-i18next";
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
  TimelineOppositeContent,
  timelineOppositeContentClasses,
  TimelineSeparator,
} from "@mui/lab";
import { formatDuration } from "~utils/DurationUtils";
import { useSnackbar } from "notistack";
import { useVideoPlayerSeekEvent } from "~hooks/use-video-player";
import CircularProgress from "@mui/material/CircularProgress";
import { ChapterForm } from "./form";

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
          <TimelineSeparator color="primary">
            <TimelineDot variant="outlined" sx={{ borderWidth: 1 }} />
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

type ChaptersPanelProps = {
  project: ProjectById;
  user?: UserMe;
};

export function ChaptersPanel({ project, user }: ChaptersPanelProps) {
  // return <div>{JSON.stringify(project)}</div>;

  if (!project.chapterJob) {
    return (
      <NoChaptersJob
        projectId={project.id}
        canGenerate={project.userId === user?.id || user?.role === "ADMIN"}
      />
    );
  }

  if (!project.chapterJob?.finishedAt) {
    return <ChaptersInProgress />;
  }
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <div>Error: {error.message}</div>}
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

  return (
    <Stack height="100%">
      <ChapterList project={project} user={user} chapters={chapters} />
      <ChapterForm project={project} user={user} chapters={chapters} />
    </Stack>
  );
}

function EmptyChapter() {
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
          marginBottom: 1,
        }}
      >
        <InfoIcon sx={{ fontSize: 30, color: "gray" }} />
        <Typography variant="body2" color="gray" textAlign={"center"}>
          {t("project.chapters.empty")}
        </Typography>
      </Stack>
    </Grow>
  );
}

function NoChaptersJob({
  projectId,
  canGenerate,
}: {
  projectId: string;
  canGenerate: boolean;
}) {
  const mutation = trpc.chapter.generateChapters.useMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const handleGenerate = async () => {
    await mutation.mutateAsync({ projectId: projectId });

    enqueueSnackbar(t("confirm.generation.sent"), {
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
          {t("project.chapters.not-found")}
        </Typography>
        {canGenerate && (
          <Button variant="contained" color="primary" onClick={handleGenerate}>
            {t("project.chapters.button.generate")}
          </Button>
        )}
      </Stack>
    </Grow>
  );
}

function ChaptersInProgress() {
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
        <CircularProgress size={20} color="secondary" />
        <Typography variant="body2" color="gray" textAlign={"center"}>
          {t("project.chapters.inProgress.description")}
        </Typography>
      </Stack>
    </Grow>
  );
}
