import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import copy from "copy-to-clipboard";
import { useSnackbar } from "notistack";
import type * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import type { ProjectById, UserMe } from "~utils/trpc";

import { ShareDialog } from "./ShareDialog";
interface ProjectEditPanelProps {
  project: ProjectById;
  user: UserMe;
}

export const SharePanel: React.FC<ProjectEditPanelProps> = ({
  project,
  user,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const handleCopyUrl = (e, text: string) => {
    e.stopPropagation();
    copy(text);
    enqueueSnackbar(t("project.sharecode.copied", "Code du projet copié"), {
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
      <ShareDialog project={project} />
      <Box sx={{ paddingTop: 1 }}>
        <Box sx={{ marginBottom: 2 }}>
          <Typography gutterBottom={true} variant="body2">
            <Trans i18nKey={"signin.projectCode"} />
          </Typography>
          <Typography
            variant="h6"
            gutterBottom={true}
            textAlign={"center"}
            sx={{
              fontFamily: "monospace",
              borderRadius: 2,
              padding: 1,
              backgroundColor: "#F7EEC0",
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
          <a
            href={`/shares/${project.id}?p=${project.shareCode}`}
            target="_blank"
            rel="noreferrer"
          >
            {t("project.share.dialog.linkText")}
          </a>
        </Typography>
      </Box>
      {/*{((user && !isOwner(project, user)) && (user && !isMember(project, user))
      && (user && !isAdmin(user)) && project.shared) &&
        <div className={classes.button}>
          <ButtonProgress
            variant="contained"
            color="primary"
            size="small"
            fullWidth={true}
            loading={unshareLoading}
            onClick={onClickShare}
          >
            {`rejoindre`}
          </ButtonProgress>
        </div>
      } */}
    </Paper>
  );
};
