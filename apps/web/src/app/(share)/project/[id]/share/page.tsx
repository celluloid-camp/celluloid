import { Suspense } from "react";
import { ShareProject } from "@/components/project/share";
import { HydrateClient, trpc } from "@/lib/trpc/server";

export default async function ShareProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // void trpc.project.byId.prefetch({ id });
  return (
    <HydrateClient>
      {/* <Suspense fallback={<p>Loading...</p>}> */}
      <ShareProject projectId={id} />
      {/* </Suspense> */}
    </HydrateClient>
  );
}
