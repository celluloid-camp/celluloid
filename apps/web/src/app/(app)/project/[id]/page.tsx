import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { projectFallbackRender } from "@/components/project/details/error-fallback";
import { ProjectMainScreen } from "@/components/project/project";
import { ProjectSkeleton } from "@/components/project/skeleton";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // void prefetch(trpc.project.byId.queryOptions({ id }));
  return (
    <HydrateClient>
      <ErrorBoundary fallbackRender={projectFallbackRender}>
        <Suspense fallback={<ProjectSkeleton />}>
          <ProjectMainScreen projectId={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
