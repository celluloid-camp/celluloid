import { Stack } from "@mui/material";
import type * as React from "react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { User } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import type { ProjectById } from "@/lib/trpc/types";
import { ChapterForm } from "./form";
import { ChaptersJobInProgress } from "./in-progress";
import { CreateChaptersJob } from "./job";
import { ChapterListSkeleton } from "./skeleton";
import { ChapterTimeline } from "./timeline";

type ChaptersPanelProps = {
  project: ProjectById;
  user?: User;
};

export function ChaptersPanel({ project, user }: ChaptersPanelProps) {
  if (!project.jobs.find((job) => job.type === "chapter")) {
    return (
      <CreateChaptersJob
        projectId={project.id}
        canGenerate={project.userId === user?.id || user?.role === "admin"}
      />
    );
  }

  if (
    !project.jobs.find((job) => job.type === "chapter")?.queueJob?.finishedAt
  ) {
    return <ChaptersJobInProgress />;
  }
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <div>Error: {error.message}</div>}
    >
      <Suspense fallback={<ChapterListSkeleton />}>
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
      <ChapterTimeline project={project} user={user} chapters={chapters} />
      {user?.id === project.userId || user?.role === "admin" ? (
        <ChapterForm project={project} user={user} chapters={chapters} />
      ) : null}
    </Stack>
  );
}
