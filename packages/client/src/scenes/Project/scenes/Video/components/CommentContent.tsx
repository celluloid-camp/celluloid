import {
  deleteCommentThunk
} from 'actions/CommentActions';
import { AsyncAction } from 'types/ActionTypes';
import {
  canEditComment
} from 'utils/AnnotationUtils';
import { isOwner } from 'utils/ProjectUtils';
import {
  AnnotationRecord,
  CommentRecord,
  ProjectGraphRecord,
  UserRecord
} from '@celluloid/types';
import {
  createStyles,
  Grow,
  IconButton,
  Theme,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import UserAvatar from 'components/UserAvatar';
import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

const styles = (theme: Theme) => createStyles({
  root: {
    transition: 'all 0.15s ease',
    minHeight: 54,
    paddingLeft: theme.spacing.unit * 2.5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: theme.spacing.unit
  },
  text: {
    ...theme.typography.caption,
    color: theme.palette.text.disabled,
    '& a:any-link': {
      color: '#42a6f5'
    },
    whiteSpace: 'pre-wrap'
  },
  content: {
    flex: '1 1 auto',
    minWidth: 0,
    padding: `0 ${theme.spacing.unit}px`,
    '&:first-child': {
      paddingLeft: 0,
    },
    margin: theme.spacing.unit / 2,
  },
  buttons: {
    width: theme.spacing.unit * 8,
    marginTop: theme.spacing.unit / 2,
    marginRight: theme.spacing.unit * 2
  },
  button: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4
  },
  icon: {
    fontSize: theme.spacing.unit * 2.5
  }
});

interface State {
  hovering: boolean;
}

interface Props
  extends WithStyles<typeof styles> {
  user?: UserRecord;
  project: ProjectGraphRecord;
  comment: CommentRecord;
  annotation: AnnotationRecord;
  onClickEdit(): void;
  onClickDelete(projectId: string, annotationId: string, comment: CommentRecord):
    AsyncAction<CommentRecord, string>;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClickDelete: (projectId: string, annotationId: string, comment: CommentRecord) =>
    deleteCommentThunk(projectId, annotationId, comment)(dispatch)
});

export default connect(null, mapDispatchToProps)(
  withStyles(styles)(
    class extends React.Component<Props, State> {
      state = {
        hovering: false
      };

      render() {
        const {
          classes,
          user,
          project,
          comment,
          annotation,
          onClickEdit,
          onClickDelete
        } = this.props;

        const { hovering } = this.state;
        const showActions =
          user
          && (canEditComment(comment, user) || isOwner(project, user))
          && hovering;

        const onHover = (hoverChange: boolean) => {
          this.setState({ hovering: hoverChange });
        };

        return (
          <div
            className={classes.root}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
          >
            <UserAvatar user={comment.user} small={true} />
            <div className={classes.content}>
              <Typography variant="caption">
                {`${comment.user.username} | ${moment(comment.createdAt).fromNow()}`}
              </Typography>
              <Typography
                className={classes.text}
                noWrap={true}
                gutterBottom={true}
              >
                {comment.text}
              </Typography>
            </div>
            <Grow in={showActions} appear={true}>
              <div className={classes.buttons}>
                {showActions &&
                  <>
                    <IconButton
                      className={classes.button}
                      onClick={() => onClickEdit()}
                    >
                      <EditIcon
                        className={classes.icon}
                        color="disabled"
                      />
                    </IconButton>
                    <IconButton
                      className={classes.button}
                      onClick={() =>
                        onClickDelete(annotation.projectId, annotation.id, comment)
                      }
                    >
                      <DeleteIcon
                        className={classes.icon}
                        color="disabled"
                      />
                    </IconButton>
                  </>
                }
              </div>
            </Grow>
          </div>
        );
      }
    })
);