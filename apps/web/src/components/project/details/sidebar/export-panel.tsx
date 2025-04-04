import { Button, ButtonGroup, Paper, Stack, Typography } from "@mui/material";
import { saveAs } from "file-saver";
import { useSnackbar } from "notistack";
import type * as React from "react";

import type { ProjectById, UserMe } from "@/lib/trpc/types";
import { trpc } from "@/lib/trpc/client";
import { useTranslations } from "next-intl";

interface Props {
	project: ProjectById;
}

export const ExportPanel: React.FC<Props> = ({ project }: Props) => {
	const t = useTranslations();

	const utils = trpc.useUtils();
	const { enqueueSnackbar } = useSnackbar();

	const handleExport = async (format: "csv" | "xml" | "srt") => {
		const data = await utils.client.annotation.export.mutate({
			projectId: project.id,
			format,
		});

		const blob = new Blob([data], {
			type: `text/${format};charset=utf-8`,
		});
		saveAs(blob, `export.${format}`);

		enqueueSnackbar(t("project.export.success"), {
			variant: "success",
			key: "project.export.success",
		});
	};

	if (project._count.annotations === 0) {
		return null;
	}

	return (
		<Paper
			sx={{
				paddingX: 3,
				marginY: 2,
				paddingY: 3,
			}}
		>
			<Typography variant="h6" mb={2}>
				{t("project.export.title")}
			</Typography>
			<Stack direction={"row"} spacing={1}>
				<ButtonGroup aria-label="text button group" variant="text">
					<Button
						sx={{ textTransform: "uppercase" }}
						onClick={() => handleExport("csv")}
					>
						CSV
					</Button>
					<Button onClick={() => handleExport("xml")}>XML</Button>
					<Button onClick={() => handleExport("srt")}>SRT</Button>
				</ButtonGroup>
			</Stack>
		</Paper>
	);
};
