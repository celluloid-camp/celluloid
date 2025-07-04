import React, {} from "react";
import { VisionStudio } from "@/components/project/studio/editor";

export default async function VisionStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VisionStudio projectId={id} />;
}
