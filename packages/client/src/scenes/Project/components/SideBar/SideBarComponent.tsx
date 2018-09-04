import { ProjectGraphRecord, UserRecord } from '@celluloid/types';
import {
  createStyles,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Theme,
  WithStyles,
  withStyles
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import ShareIcon from '@material-ui/icons/Share';
import ButtonProgress from 'components/ButtonProgress';
import DialogError from 'components/DialogError';
import LabeledProgressSwitch from 'components/LabeledProgressSwitch';
import UserAvatar from 'components/UserAvatar';
import VisibilityChip from 'components/VisibilityChip';
import * as React from 'react';
import { AsyncAction } from 'types/ActionTypes';
import { isOwner } from 'utils/ProjectUtils';

import ShareDialog from './components/ShareDialog';

const styles = ({ spacing }: Theme) => createStyles({
  button: {
    padding: spacing.unit,
    paddingBottom: 0
  },
  paper: {
    marginTop: 0,
    margin: spacing.unit,
    padding: spacing.unit
  },
  list: {
    padding: 0,
    paddingBottom: spacing.unit * 2
  },
  listItem: {
    padding: 0,
  },
  listHeader: {
    height: spacing.unit * 5,
    textAlign: 'left',
    marginTop: spacing.unit,
    paddingLeft: spacing.unit
  },
  buttonIcon: {
    marginRight: spacing.unit * 2
  },
  chips: {
    paddingTop: spacing.unit,
    textAlign: 'right'
  }
});

export interface Member extends UserRecord {
  subtitle?: string;
}

interface Props extends WithStyles<typeof styles> {
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
  onClickSetPublic(projectId: string, value: boolean):
    AsyncAction<ProjectGraphRecord, string>;
  onClickSetCollaborative(projectId: string, value: boolean):
    AsyncAction<ProjectGraphRecord, string>;
  onClickShare(): void;
  onClickDelete(projectId: string): AsyncAction<null, string>;
}

export default withStyles(styles)(({
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
  classes
}: Props) => (
    <>
      {(user && isOwner(project, user))
        ? (
          <>
            <LabeledProgressSwitch
              label="public"
              checked={project.public}
              loading={setPublicLoading}
              error={setPublicError}
              onChange={() =>
                onClickSetPublic(project.id, !project.public)
              }
            />
            <LabeledProgressSwitch
              label="collaboratif"
              checked={project.collaborative}
              loading={setCollaborativeLoading}
              error={setCollaborativeError}
              onChange={() =>
                onClickSetCollaborative(project.id, !project.collaborative)
              }
            />
          </>
        ) : (
          <div className={classes.chips}>
            <VisibilityChip
              show={project.public}
              label="public"
            />
            <VisibilityChip
              show={project.collaborative}
              label="collaboratif"
            />
          </div>
        )
      }
      {(user && isOwner(project, user)) &&
        <div className={classes.button}>
          <ButtonProgress
            variant="raised"
            color="primary"
            size="small"
            fullWidth={true}
            loading={unshareLoading}
            onClick={onClickShare}
          >
            <ShareIcon fontSize="inherit" className={classes.buttonIcon} />
            {`partager`}
          </ButtonProgress>
          <ShareDialog
            project={project}
          />
        </div>
      }
      <List
        dense={true}
        className={classes.list}
        subheader={
          <ListSubheader
            className={classes.listHeader}
          >
            {members.size}
            {members.size > 1 ? ` participants` : ` participant`}
          </ListSubheader>
        }
      >
        {Array.from(members).map((member: Member) => (
          <ListItem key={member.id} className={classes.listItem}>
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
      {(user && isOwner(project, user)) &&
        <div className={classes.button}>
          <ButtonProgress
            variant="raised"
            color="secondary"
            size="small"
            fullWidth={true}
            loading={deleteLoading}
            onClick={() => onClickDelete(project.id)}
          >
            <DeleteIcon fontSize="inherit" className={classes.buttonIcon} />
            {`Supprimer`}
          </ButtonProgress>
          {deleteError && <DialogError error={deleteError} />}
        </div>
      }
    </>
  )
);