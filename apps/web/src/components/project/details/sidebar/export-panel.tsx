import { Button, ButtonGroup, Paper, Stack, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import type * as React from "react";
import { useTRPC } from "@/lib/trpc/client";
import type { ProjectById } from "@/lib/trpc/types";

interface Props {
  project: ProjectById;
}

export const ExportPanel: React.FC<Props> = ({ project }: Props) => {
  const t = useTranslations();

  const api = useTRPC();
  const { enqueueSnackbar } = useSnackbar();
  const { data: annotations } = useQuery(
    api.annotation.byProjectId.queryOptions({
      id: project.id,
    }),
  );
  const exportMutation = useMutation(api.annotation.export.mutationOptions());

  const handleExport = async (format: "csv" | "xml" | "srt") => {
    const data = await exportMutation.mutateAsync({
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

  if (annotations?.length === 0) {
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
      <Typography
        variant="h6"
        sx={{
          mb: 2,
        }}
      >
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
