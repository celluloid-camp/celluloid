import { ProjectMainScreen } from "@/components/project/project";
import { ProjectSkeleton } from "@/components/project/skeleton";
import { HydrateClient, trpc } from "@/lib/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void trpc.project.byId.prefetch({ id });
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<ProjectSkeleton />}>
          <ProjectMainScreen projectId={id} />
        </Suspense>
      </ErrorBoundary>
      <ProjectSkeleton />
    </HydrateClient>
  );
}
