import { ProjectGraphRecord, UserRecord } from "@celluloid/types";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import ButtonProgress from "components/ButtonProgress";
import DialogError from "components/DialogError";
import LabeledProgressSwitch from "components/LabeledProgressSwitch";
import ShareCredentials from "components/ShareCredentials";
import UserAvatar from "components/UserAvatar";
import VisibilityChip from "components/VisibilityChip";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AsyncAction } from "types/ActionTypes";
import { isAdmin, isOwner } from "utils/ProjectUtils";

import ShareDialog from "./components/ShareDialog";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     button: {
//       padding: spacing.unit,
//       paddingBottom: 0,
//     },
//     paper: {
//       marginTop: 0,
//       margin: spacing.unit,
//       padding: spacing.unit,
//     },
//     list: {
//       padding: 0,
//       paddingBottom: spacing.unit * 2,
//     },
//     listItem: {
//       padding: 0,
//     },
//     listHeader: {
//       height: spacing.unit * 5,
//       textAlign: "left",
//       marginTop: spacing.unit,
//       paddingLeft: spacing.unit,
//     },
//     buttonIcon: {
//       marginRight: spacing.unit * 2,
//     },
//     chips: {
//       paddingTop: spacing.unit,
//       textAlign: "right",
//     },
//   });

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

  return (
    <>
      {user && isOwner(project, user) ? (
        <>
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
        </>
      ) : (
        <Box sx={{ paddingTop: 1 }}>
          <VisibilityChip
            show={project.public}
            label={t("project.public").toLowerCase()}
          />
          <VisibilityChip
            show={project.collaborative}
            label={t("project.collaborative").toLowerCase()}
          />
        </Box>
      )}
      {user && isOwner(project, user) && (
        <>
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
              <ShareCredentials
                name={project.shareName}
                password={project.sharePassword}
              />
              {t("project.share.dialog.description")}
              <a
                href={`/shares/${project.id}?p=${project.sharePassword}`}
                target="_blank"
                rel="noreferrer"
              >
                {t("project.share.dialog.linkText")}
              </a>
              .
            </Box>
          )}
        </>
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
      {user && isOwner(project, user) && (
        <List
          dense={true}
          sx={{
            padding: 0,
            paddingBottom: 2,
          }}
          subheader={
            <ListSubheader>
              {t("project.members", { count: members.size })}
            </ListSubheader>
          }
        >
          {Array.from(members).map((member: Member) => (
            <ListItem key={member.id}>
              {/* @ts-ignore */}
              <ListItemAvatar>
                <UserAvatar user={member} />
              </ListItemAvatar>
              <ListItemText
                primary={member.username}
                secondary={member.subtitle}
              />
            </ListItem>
          ))}
        </List>
      )}

      {user && isAdmin(user) && (
        <List
          dense={true}
          sx={{
            padding: 0,
            paddingBottom: 2,
          }}
          subheader={
            <ListSubheader>
              {t("project.members", { count: members.size })}
            </ListSubheader>
          }
        >
          {Array.from(members).map((member: Member) => (
            <ListItem key={member.id}>
              {/* @ts-ignore */}
              <ListItemAvatar>
                <UserAvatar user={member} />
              </ListItemAvatar>
              <ListItemText
                primary={member.username}
                secondary={member.subtitle}
              />
              <ListItemText primary={member.email} />
            </ListItem>
          ))}
        </List>
      )}

      {((user && isOwner(project, user)) || (user && isAdmin(user))) && (
        <Box
          sx={{
            padding: 2,
            paddingBottom: 0,
          }}
        >
          <ButtonProgress
            variant="contained"
            color="secondary"
            size="small"
            fullWidth={true}
            loading={deleteLoading}
            onClick={() => onClickDelete(project.id)}
          >
            <DeleteIcon fontSize="inherit" sx={{ marginRight: 2 }} />
            {t("deleteAction")}
          </ButtonProgress>
          {deleteError && <DialogError error={deleteError} />}
        </Box>
      )}
    </>
  );
};

export default SideBarComponenent;
