import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import {
  Box,
  colors,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from "@mui/material";
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
    <Paper>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          paddingX: 2,
          display: "flex",
          alignItems: "center",
          justifyItems: "center",
          gap: 1,
          paddingY: 2,
        }}
      >
        <ShareIcon fontSize="small" />
        <Typography gutterBottom variant="h6">
          {t("project.share.section.title")}
        </Typography>
      </Box>
      <Box sx={{ paddingTop: 1, paddingX: 2, paddingY: 2 }}>
        <Box
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            border: 1,
            backgroundColor: "#F7EEC0",
            borderRadius: 1,
            borderColor: colors.yellow[600],
          }}
        >
          <Typography
            variant="h6"
            gutterBottom={true}
            sx={{
              textAlign: "center",
              fontFamily: "monospace",
              flex: 1,
            }}
          >
            {project.shareCode}
          </Typography>
          <Divider
            sx={{ height: 28, m: 0.5, borderColor: colors.yellow[600] }}
            orientation="vertical"
          />
          <IconButton
            sx={{ p: "10px" }}
            onClick={(e) => handleCopyUrl(e, `${project.shareCode}`)}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ paddingTop: 1 }}>
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
      </Box>
    </Paper>
  );
};
