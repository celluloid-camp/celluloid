import { Box, Stack } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import type * as React from "react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { User } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import type { ProjectById } from "@/lib/trpc/types";
import { ChapterForm } from "./form";
import { ChaptersJobInProgress } from "./in-progress";
import { CreateChaptersJob } from "./job";
import { ChapterListSkeleton } from "./skeleton";
import { ChapterTimeline } from "./timeline";
import { ScenesProcessingFailed } from "./workflow-failed";

type ChaptersPanelProps = {
  project: ProjectById;
  user?: User;
};

export function ChaptersPanel({ project, user }: ChaptersPanelProps) {
  if (project.scenesProcessingStatus === "not_started") {
    return (
      <CreateChaptersJob
        projectId={project.id}
        canGenerate={project.userId === user?.id || user?.role === "admin"}
      />
    );
  }

  if (project.scenesProcessingStatus === "in_progress") {
    return <ChaptersJobInProgress />;
  }
  if (project.scenesProcessingStatus === "failed") {
    return (
      <ScenesProcessingFailed
        projectId={project.id}
        canGenerate={project.userId === user?.id || user?.role === "admin"}
      />
    );
  }

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <Box>Failed to load chapters</Box>}
    >
      <Suspense fallback={<ChapterListSkeleton />}>
        <ChaptersPanelContent project={project} user={user} />
      </Suspense>
    </ErrorBoundary>
  );
}

export function ChaptersPanelContent({ project, user }: ChaptersPanelProps) {
  const api = useTRPC();
  const { data: chapters } = useSuspenseQuery(
    api.chapter.byProjectId.queryOptions({
      projectId: project.id,
    }),
  );

  return (
    <Stack height="100%">
      <ChapterTimeline project={project} user={user} chapters={chapters} />
      {user?.id === project.userId || user?.role === "admin" ? (
        <ChapterForm project={project} user={user} chapters={chapters} />
      ) : null}
    </Stack>
  );
}
