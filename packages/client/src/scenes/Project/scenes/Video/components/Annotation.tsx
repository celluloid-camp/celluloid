import * as React from 'react';

import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Collapse, IconButton, Typography } from '@material-ui/core';

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import { AnnotationData, AnnotationRecord } from '@celluloid/commons';
import { formatDuration } from 'utils/DurationUtils';
import ProjectsService from 'services/ProjectService';
import { WithUser, getUserColor, getUserInitials } from 'types/UserTypes';
import AnnotationContent from './AnnotationContent';
import AnnotationControls from './AnnotationControls';

const styles = (theme: Theme) => createStyles({
  actionWrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: 6 + 48 + 6 + 48 + 6,
    padding: 6,
    marginRight: theme.spacing.unit
  },
  annotationWrapper: {
    paddingTop: 0,
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  inputWrapper: {
    display: 'flex',
    flex: 1,
    color: 'white'
  },
  content: {
    flex: '1 1 auto',
    minWidth: 0,
    padding: '0 16px',
    '&:first-child': {
      paddingLeft: 0,
    },
    margin: 10,
    color: 'white'
  },
  input: {
    color: 'white',
  },
  inputRoot: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)'
  },
  inputLabel: {
    color: '#CCC !important',
  },
  username: {
    color: 'white'
  },
  timings: {
    ...theme.typography.caption,
    color: '#CCC',
    display: 'inline'
  }
});

interface Props extends WithUser, WithStyles<typeof styles> {
  annotation?: AnnotationRecord;
  video: {
    position: number;
    duration: number;
  };
  projectId: string;
  onSave(): void;
  onCancel(): void;
  onSeek(position: number): void;
}

interface State {
  focused: boolean;
  annotation: AnnotationData;
  startError?: string;
  isEditing: boolean;
  author: {
    id: string;
    email: string;
    username: string;
  };
  error?: string;
}

const DEFAULT_ANNOTATION_DURATION = 60;

function maxAnnotationDuration(startTime: number, duration: number) {
  const stopTime = startTime + DEFAULT_ANNOTATION_DURATION;
  return (stopTime < duration ? stopTime : duration);
}

function init({ annotation, user, video }: Props): State {
  if (annotation) {
    return {
      focused: false,
      isEditing: false,
      author: annotation.teacher,
      annotation: annotation
    };
  } else {
    return {
      focused: true,
      isEditing: true,
      author: user,
      annotation: {
        text: '',
        startTime: video.position,
        stopTime: maxAnnotationDuration(
          video.position,
          video.duration
        ),
        pause: false
      }
    } as State;
  }
}

export default withStyles(styles)(
  class extends React.Component<Props, State> {
    state = init(this.props);

    render() {
      const {
        classes,
        user,
        projectId,
        video,
        onSeek,
        onSave,
        onCancel
      } = this.props;

      const {
        error,
        author,
        annotation,
        focused,
        isEditing
      } = this.state;

      const avatarLabel = getUserInitials(author);

      const formattedStart = formatDuration(annotation.startTime);

      const formattedStop = formatDuration(annotation.stopTime);

      const canEdit = user
        && user.id === author.id
        && focused
        && !isEditing;

      const onCheckPauseChange = (pause: boolean) => {
        annotation.pause = pause;
        this.setState({ annotation });
      };

      const onTimingChange = (position: number, isStart: boolean) => {
        const state = this.state as State;
        if (isStart) {
          state.annotation.startTime = position;
        } else {
          state.annotation.stopTime = position;
        }
        this.setState(state);
        onSeek(position);
      };

      const onSaveSuccess = () => {
        this.setState({ isEditing: false, error: undefined });
        onSave();
      };

      const onClickSave = () => {
        if (!this.props.annotation) {
          ProjectsService.createAnnotation(projectId, annotation)
            .then(onSaveSuccess)
            .catch(e => this.setState({ error: e.message }));
        } else {
          ProjectsService.updateAnnotation(
            projectId,
            this.props.annotation.id,
            annotation
          )
            .then(onSaveSuccess)
            .catch(e =>
              this.setState({ error: e.message })
            );
        }
      };

      const onClickDelete = () => {
        if (this.props.annotation) {
          ProjectsService.deleteAnnotation(projectId, this.props.annotation.id)
            .then(onSaveSuccess)
            .catch(e => this.setState({ error: e.message }));
        }
      };

      const onClickEdit = () => {
        this.setState({
          isEditing: !isEditing,
        });
      };

      const onClickCancel = () => {
        if (this.props.annotation) {
          this.setState(() => ({
            ...init(this.props),
            isEditing: false,
          }));
        } else {
          onCancel();
        }
      };

      return (
        <Collapse in={true} appear={true}>
          <div
            className={classes.annotationWrapper}
          >
            <Avatar
              style={{
                margin: 10,
                backgroundColor: getUserColor(author.id)
              }}
            >
              {avatarLabel}
            </Avatar>
            <div
              className={classes.content}
              onClick={() =>
                this.setState({ focused: !focused }
              )}
            >
              {this.state.isEditing ?
                <Collapse in={isEditing} appear={true}>
                  <>
                    <TextField
                      multiline={true}
                      InputLabelProps={{
                        classes: {
                          root: classes.inputLabel
                        }
                      }}
                      InputProps={{
                        disableUnderline: true,
                        classes: {
                          root: classes.inputRoot,
                          input: classes.input,
                        }
                      }}
                      label="Saisissez votre annotation"
                      className={classes.inputWrapper}
                      value={this.state.annotation.text}
                      onChange={event => {
                        annotation.text = event.target.value;
                        this.setState({ annotation });
                      }}
                      error={error ? true : false}
                      helperText={error}
                    />
                    <AnnotationControls
                      startTime={annotation.startTime}
                      stopTime={annotation.stopTime}
                      pause={annotation.pause}
                      duration={video.duration}
                      onTimingChange={onTimingChange}
                      onCheckPauseChange={onCheckPauseChange}
                      onClickSave={onClickSave}
                      onClickCancel={onClickCancel}
                    />
                  </>
                </Collapse> :
                <>
                  <Typography className={classes.username}>
                    {`${author.username} | `}
                    <span className={classes.timings}>
                      {`${formattedStart} - ${formattedStop}`}
                    </span>
                  </Typography>
                  <AnnotationContent
                    content={annotation.text}
                    focused={focused}
                  />
                </>
              }
            </div>
            <div className={classes.actionWrapper}>
              {canEdit &&
                <>
                  <IconButton
                    color="primary"
                    onClick={onClickEdit}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={(event) => {
                      event.preventDefault();
                      onClickDelete();
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            </div>
          </div>
        </Collapse>
      );
    }
  }
);