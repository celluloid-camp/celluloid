"use client";
import {
  StyledDialog,
  StyledDialogTitle,
} from "@/components/common/styled-dialog";
import { DialogTitle } from "@mui/material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { EditProjectDialogSkeleton } from "./edit-dialog-skeleton";
import { EditProjectForm } from "./edit-project-form";

export function EditProjectDialog({ projectId }: { projectId: string }) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <>
      <StyledDialog maxWidth="md" open={true}>
        <StyledDialogTitle onClose={() => router.back()}>
          {t("project.edit.dialog.title")}
        </StyledDialogTitle>
        <Suspense fallback={<EditProjectDialogSkeleton />}>
          <EditProjectForm projectId={projectId} />
        </Suspense>
      </StyledDialog>
    </>
  );
}
