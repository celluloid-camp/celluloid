"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { StyledDialog } from "@/components/common/styled-dialog";
import { Suspense } from "react";
import { EditProjectForm } from "./edit-project-form";
import { EditProjectDialogSkeleton } from "./edit-dialog-skeleton";

export function EditProjectDialog({ projectId }: { projectId: string }) {
	const t = useTranslations();
	const router = useRouter();

	return (
		<StyledDialog
			title={t("project.edit.dialog.title")}
			onClose={() => router.back()}
			maxWidth="md"
			open={true}
		>
			<Suspense fallback={<EditProjectDialogSkeleton />}>
				<EditProjectForm projectId={projectId} />
			</Suspense>
		</StyledDialog>
	);
}
