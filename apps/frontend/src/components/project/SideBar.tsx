import DeleteIcon from "@mui/icons-material/Delete";
import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";
import { LoadingButton } from "@mui/lab";
import {
  Avatar,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";

import DialogError from "~components/DialogError";
import LabeledProgressSwitch from "~components/LabeledProgressSwitch";
import { PlaylistSideBar } from "~components/PlaylistSideBar";
import { UserAvatar } from "~components/UserAvatar";
import { isAdmin, isOwner } from "~utils/ProjectUtils";
import { trpc } from "~utils/trpc";

import { ShareDialog } from "./ShareDialog";

interface Props {
  project: ProjectById;
  user: UserMe;
}

export const SideBar: React.FC<Props> = ({ project, user }: Props) => {
  const { t } = useTranslation();
  const confirm = useConfirm();

  const handleDelete = (id: string) => {};

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
      handleDelete(project.id);
    });
  };

  const handleExport = (format: "csv" | "xml" | "srt") => {
    // AnnotationService.export(project.id, format);
  };

  return (
    <Box>
      <Stack direction={"row"} spacing={1} sx={{ mb: 2 }}>
        {project.public && (
          <Chip
            label={t("project.public")}
            size="small"
            icon={<PublicIcon />}
          />
        )}

        {project.collaborative && (
          <Chip
            label={t("project.collaborative")}
            size="small"
            icon={<GroupsIcon />}
          />
        )}
      </Stack>

      {project && project.playlist ? (
        <PlaylistSideBar project={project} />
      ) : null}

      <Paper
        sx={{
          paddingX: 3,
          marginY: 2,
          paddingY: 3,
        }}
      >
        {user && project.userId == user.id ? (
          <>
            <Typography variant="h6" mb={2}>
              {t("project.edit", "Modification")}
            </Typography>
            {/* <LabeledProgressSwitch
              label={t("project.public")}
              checked={project.public}
              loading={setPublicLoading}
              error={setPublicError}
              onChange={() => onClickSetPublic(project.id, !project.public)}
            />
            <LabeledProgressSwitch
              label={t("project.collaborative")}
              checked={project.collaborative}
              loading={setCollaborativeLoading}
              error={setCollaborativeError}
              onChange={() =>
                onClickSetCollaborative(project.id, !project.collaborative)
              }
            />
            <LabeledProgressSwitch
              label={t("project.shared")}
              checked={project.shared}
              loading={unshareLoading}
              error={unshareError}
              onChange={() => onClickShare()}
            /> */}
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
                      padding: 1,
                      borderRadius: 10,
                      backgroundColor: "#F7EEC0",
                    }}
                  >
                    {`${project.shareName}-${project.sharePassword}`}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {t("project.share.dialog.description")}
                  <a
                    href={`/shares/${project.id}?p=${project.sharePassword}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("project.share.dialog.linkText")}
                  </a>
                </Typography>
                .
              </Box>
            )}
          </>
        ) : null}

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

        {user && isOwner(project, user) && (
          <>
            <Typography variant="h6" mb={2}>
              {t("project.members", { count: project._count.members })}
            </Typography>
            <List
              dense={true}
              sx={{
                width: "100%",
                maxWidth: 360,
                bgcolor: "neutral.100",
                position: "relative",
                overflow: "auto",
                borderRadius: 2,
                minHeight: 300,
                maxHeight: 300,
                "& ul": { padding: 0 },
              }}
            >
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ background: project.user.color }}>
                    {project.user.initial}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={project.user.username}
                  secondary={project.user.role}
                />
              </ListItem>

              {project.members.map((member: UserById) => (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ background: member.user.color }}>
                      {member.user.initial}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.user.username}
                    secondary={member.user.role}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {project.deletable && (
          <Box
            sx={{
              padding: 2,
            }}
          >
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
            {/* {deleteError && <DialogError error={deleteError} />} */}
          </Box>
        )}

        {project._count.annotations > 0 ? (
          <>
            <Typography variant="h6" mb={2}>
              {t("project.export", "Export annotations")}
            </Typography>
            <Stack direction={"row"} spacing={1}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ textTransform: "uppercase" }}
                onClick={() => handleExport("csv")}
              >
                CSV
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleExport("xml")}
              >
                XML
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleExport("srt")}
              >
                SRT
              </Button>
            </Stack>
          </>
        ) : null}
      </Paper>
    </Box>
  );
};
