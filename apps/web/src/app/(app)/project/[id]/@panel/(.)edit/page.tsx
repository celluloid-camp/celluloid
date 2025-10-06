"use client";
import { useParams, useRouter } from "next/navigation";
import React, { Suspense } from "react";
import { StyledDialog } from "@/components/common/styled-dialog";
import { EditProjectDialog } from "@/components/project/edit/edit-dialog";
import { EditProjectDialogSkeleton } from "@/components/project/edit/edit-dialog-skeleton";

export default function ProjectEditDialog() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <Suspense fallback={<EditProjectDialogSkeleton />}>
      <EditProjectDialog projectId={projectId} />
    </Suspense>
  );
}
