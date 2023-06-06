import { ProjectGraphRecord, UserRecord } from "@celluloid/types";
import DeleteIcon from "@mui/icons-material/Delete";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";

import DialogError from "~components/DialogError";
import LabeledProgressSwitch from "~components/LabeledProgressSwitch";
import { UserAvatar } from "~components/UserAvatar";
import { useGetAnnotationsQuery } from "~hooks/user-project";
import AnnotationService from "~services/AnnotationService";
import { AsyncAction } from "~types/ActionTypes";
import { isAdmin, isOwner } from "~utils/ProjectUtils";

import ShareDialog from "./components/ShareDialog";

export interface Member extends UserRecord {
  subtitle?: string;
}

interface Props {
  user?: UserRecord;
  project: ProjectGraphRecord;
  members: Set<Member>;
  setPublicLoading: boolean;
  setCollaborativeLoading: boolean;
  unshareLoading: boolean;
  deleteLoading: boolean;
  setPublicError?: string;
  setCollaborativeError?: string;
  unshareError?: string;
  deleteError?: string;
  onClickSetPublic(
    projectId: string,
    value: boolean
  ): AsyncAction<ProjectGraphRecord, string>;
  onClickSetCollaborative(
    projectId: string,
    value: boolean
  ): AsyncAction<ProjectGraphRecord, string>;
  onClickShare(): void;
  onClickDelete(projectId: string): AsyncAction<null, string>;
}

const SideBarComponenent: React.FC<Props> = ({
  user,
  project,
  members,
  setCollaborativeLoading,
  setPublicLoading,
  unshareLoading,
  deleteLoading,
  setPublicError,
  setCollaborativeError,
  unshareError,
  deleteError,
  onClickSetPublic,
  onClickSetCollaborative,
  onClickShare,
  onClickDelete,
}: Props) => {
  const { t } = useTranslation();
  const confirm = useConfirm();

  const { data: annotations } = useGetAnnotationsQuery(project.id);

  const handleDelete = () => {
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
      onClickDelete(project.id);
    });
  };

  const handleExport = (format: "csv" | "xml" | "srt") => {
    AnnotationService.export(project.id, format);
  };

  return (
    <Box>
      <Stack direction={"row"} spacing={1}>
        {project.public && (
          <Chip label={t("project.public").toUpperCase()} size="small" />
        )}

        {project.collaborative && (
          <Chip label={t("project.collaborative").toUpperCase()} size="small" />
        )}
      </Stack>

      <Box
        sx={{
          backgroundColor: "white",
          paddingX: 3,
          marginY: 2,
          paddingY: 3,
          borderRadius: 2,
        }}
      >
        {annotations && annotations.length > 0 ? (
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

        {user && isOwner(project, user) ? (
          <>
            <Typography variant="h6" mb={2}>
              {t("project.edit", "Modification")}
            </Typography>
            <LabeledProgressSwitch
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
              {t("project.members", { count: members.size })}
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
              {Array.from(members).map((member: Member) => (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <UserAvatar username={member.username} userId={member.id} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.username}
                    secondary={member.subtitle}
                  />
                  {isAdmin(user) && <ListItemText primary={member.email} />}
                </ListItem>
              ))}
            </List>
          </>
        )}

        {((user && isOwner(project, user)) || (user && isAdmin(user))) && (
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
              loading={deleteLoading}
              onClick={handleDelete}
            >
              <DeleteIcon fontSize="inherit" sx={{ marginRight: 2 }} />
              {t("deleteAction")}
            </LoadingButton>
            {deleteError && <DialogError error={deleteError} />}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SideBarComponenent;
