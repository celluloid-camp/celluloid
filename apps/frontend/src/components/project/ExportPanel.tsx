import { InfoOutlined } from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  IconButton,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { saveAs } from "file-saver";
import { useSnackbar } from "notistack";
import type * as React from "react";
import { useTranslation } from "react-i18next";

import { type ProjectById, trpc, type UserMe } from "~utils/trpc";

interface Props {
  project: ProjectById;
  user?: UserMe;
}

export const ExportPanel: React.FC<Props> = ({ project }: Props) => {
  const { t } = useTranslation();

  const utils = trpc.useUtils();
  const { enqueueSnackbar } = useSnackbar();

  const handleExport = async (format: "csv" | "xml" | "srt" | "xlsx") => {
    const data = await utils.client.annotation.export.mutate({
      projectId: project.id,
      format,
    });

    let blob: Blob;
    if (format === "xlsx") {
      // Convert base64 to blob for xlsx
      const binaryString = window.atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    } else {
      // Handle other formats as before
      blob = new Blob([data], {
        type: `text/${format};charset=utf-8`,
      });
    }

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
          <Button
            onClick={() => handleExport("xlsx")}
            endIcon={
              <Tooltip title={"XLSX with Dublin metadata"}>
                <IconButton size="small" sx={{ ml: -1 }}>
                  <InfoOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            XLSX
          </Button>
        </ButtonGroup>
      </Stack>
    </Paper>
  );
};
