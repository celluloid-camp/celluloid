import { Suspense } from "react";
import { HydrateClient, trpc } from "@/lib/trpc/server";
import { ShareProject } from "@/components/project/share";

export default async function ShareProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void trpc.project.byId.prefetch({ id });
  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading...</p>}>
        <ShareProject projectId={id} />
      </Suspense>
    </HydrateClient>
  );
}
