import ButtonProgress from '@celluloid/client/src/components/ButtonProgress';
import DialogError from '@celluloid/client/src/components/DialogError';
import LabeledProgressSwitch from '@celluloid/client/src/components/LabeledProgressSwitch';
import VisibilityChip from '@celluloid/client/src/components/VisibilityChip';
import { isOwner } from '@celluloid/client/src/utils/ProjectUtils';
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
import UserAvatar from 'components/UserAvatar';
import * as React from 'react';
import { AsyncAction } from 'types/ActionTypes';

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
            <LabeledProgressSwitch
              label="partagé"
              checked={project.shared}
              loading={unshareLoading}
              error={unshareError}
              onChange={() => onClickShare()}
            />
            <ShareDialog
              project={project}
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
      <List
        dense={true}
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
          <ListItem key={member.id} className={classes.list}>
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