import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { LoadingButton } from "@mui/lab";
import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import copy from "copy-to-clipboard";
import { useConfirm } from "material-ui-confirm";
import { useSnackbar } from "notistack";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import LabeledProgressSwitch from "~components/LabeledProgressSwitch";
import { ProjectById, trpc, UserMe } from "~utils/trpc";

import { ShareDialog } from "./ShareDialog";
interface ProjectEditPanelProps {
  project: ProjectById;
  user: UserMe;
}

export const ProjectEditPanel: React.FC<ProjectEditPanelProps> = ({
  project,
  user,
}) => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const utils = trpc.useContext();

  const updateMutation = trpc.project.update.useMutation({
    onSuccess: () => {
      utils.project.byId.invalidate({ id: project.id });
      enqueueSnackbar(t("project.edit.success", "Project a été mise à jour"), {
        variant: "success",
        key: "project.edit.success",
      });
    },
    onError: (e) => {
      console.log(e);
      enqueueSnackbar(
        t("project.edit.error", "Project n'a pas été mise à jour"),
        { variant: "error", key: "project.edit.error" }
      );
    },
  });

  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
      navigate("/");
    },
    onError: (e) => {
      console.log(e);
      enqueueSnackbar(
        t("project.delete.error", "Project n'a pas pu être supprimé", {
          variant: "error",
          key: "project.delete.error",
        })
      );
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({
      projectId: project.id,
    });
  };

  const confirmDelete = () => {
    confirm({
      title: t("project.confirm-delete.title", "Delete project"),
      description: t("project.confirm-delete.description", "Are you sure ?"),
      confirmationText: t("deleteAction"),
      cancellationText: t("cancelAction"),
      confirmationButtonProps: {
        variant: "contained",
        color: "error",
      },
    }).then(() => {
      handleDelete();
    });
  };

  const handleCopyUrl = (e, text: string) => {
    e.stopPropagation();
    copy(text);
    enqueueSnackbar(t("project.sharecode.copied", "Code du projet copié"), {
      variant: "success",
    });
  };

  return (
    <Paper
      sx={{
        paddingX: 3,
        marginY: 2,
        paddingY: 3,
      }}
    >
      {user && project.userId == user.id ? (
        <>
          <Typography gutterBottom variant="h6">
            {t("project.edit", "Modification")}
          </Typography>
          <LabeledProgressSwitch
            label={t("project.public")}
            checked={project.public}
            loading={updateMutation.isLoading}
            onChange={() =>
              updateMutation.mutate({
                projectId: project.id,
                public: !project.public,
              })
            }
          />
          <LabeledProgressSwitch
            label={t("project.collaborative")}
            checked={project.collaborative}
            loading={updateMutation.isLoading}
            onChange={() =>
              updateMutation.mutate({
                projectId: project.id,
                collaborative: !project.collaborative,
              })
            }
          />
          <LabeledProgressSwitch
            label={t("project.shared")}
            checked={project.shared}
            loading={updateMutation.isLoading}
            onChange={() =>
              updateMutation.mutate({
                projectId: project.id,
                shared: !project.shared,
              })
            }
          />
          <ShareDialog project={project} />
          {project.shared && (
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
          )}
        </>
      ) : null}

      {project.deletable && (
        <Box
          sx={{
            width: "100%",
            mt: 2,
          }}
        >
          <Divider variant="middle" />
          <Box sx={{ m: 2 }}>
            <LoadingButton
              variant="contained"
              color="error"
              size="small"
              fullWidth={true}
              // loading={deleteLoading}
              onClick={confirmDelete}
            >
              <DeleteIcon fontSize="inherit" sx={{ marginRight: 2 }} />
              {t("deleteAction")}
            </LoadingButton>
          </Box>
          {/* {deleteError && <DialogError error={deleteError} />} */}
        </Box>
      )}

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
