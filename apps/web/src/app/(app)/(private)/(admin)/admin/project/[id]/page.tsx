import { Suspense } from "react";
import { ProjectDetails } from "@/components/admin/details/project";
import ProjectPageLoading from "./loading";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<ProjectPageLoading />}>
      <ProjectDetails projectId={id} />
    </Suspense>
  );
}
