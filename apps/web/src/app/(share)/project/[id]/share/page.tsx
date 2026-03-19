import { Suspense } from "react";
import { ShareProject } from "@/components/project/share";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export default async function ShareProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ShareProject projectId={id} />;
}
