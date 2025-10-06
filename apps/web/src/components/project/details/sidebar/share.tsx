import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, colors, IconButton, Paper, Typography } from "@mui/material";
import copy from "copy-to-clipboard";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import type * as React from "react";

import type { User } from "@/lib/auth-client";
import type { ProjectById } from "@/lib/trpc/types";

interface SharePanelProps {
  project: ProjectById;
  user: User;
}

export const Share: React.FC<SharePanelProps> = ({ project, user }) => {
  const t = useTranslations();
  const { enqueueSnackbar } = useSnackbar();

  const handleCopyUrl = (
    e: React.MouseEvent<HTMLButtonElement>,
    text: string,
  ) => {
    e.stopPropagation();
    copy(text);
    enqueueSnackbar(t("project.sharecode.copied"), {
      variant: "success",
    });
  };

  if (!project.shared || (user && project.userId !== user.id)) {
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
      <Typography gutterBottom variant="h6">
        {t("project.share.section.title")}
      </Typography>
      <Box sx={{ paddingTop: 1 }}>
        <Box sx={{ marginBottom: 2 }}>
          <Typography gutterBottom={true} variant="body2">
            {t("signin.projectCode")}
          </Typography>
          <Typography
            variant="h6"
            gutterBottom={true}
            textAlign={"center"}
            sx={{
              fontFamily: "monospace",
              borderRadius: 1,
              borderStyle: "dashed",
              borderColor: colors.yellow[600],
              padding: 1,
              backgroundColor: "#F7EEC0",
              borderWidth: 2,
            }}
          >
            {project.shareCode}
            <IconButton
              onClick={(e) => handleCopyUrl(e, `${project.shareCode}`)}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Typography>
        </Box>
        <Typography variant="body2">
          {t("project.share.dialog.description")}
          <Link
            href={`/project/${project.id}/share`}
            target="_blank"
            rel="noreferrer"
          >
            {t("project.share.dialog.linkText")}
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
};
