import { Button, ButtonGroup, Paper, Stack, Typography } from "@mui/material";
import { saveAs } from "file-saver";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ProjectById, trpc, UserMe } from "~utils/trpc";

interface Props {
  project: ProjectById;
  user?: UserMe;
}

export const ExportPanel: React.FC<Props> = ({ project }: Props) => {
  const { t } = useTranslation();

  const [exportFormat, setExportFormat] = useState<
    "csv" | "xml" | "srt" | undefined
  >(undefined);

  trpc.annotation.export.useQuery(
    { projectId: project.id, format: exportFormat || "csv" },
    {
      enabled: !!exportFormat,
      onSuccess: (data) => {
        const blob = new Blob([data], {
          type: `text/${exportFormat};charset=utf-8`,
        });
        saveAs(blob, `export.${exportFormat}`);
        setExportFormat(undefined);
      },
    }
  );

  const handleExport = (format: "csv" | "xml" | "srt") => {
    setExportFormat(format);
  };

  if (project._count.annotations == 0) {
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
        {t("project.export", "Export annotations")}
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
