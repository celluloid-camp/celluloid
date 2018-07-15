import * as React from 'react';

import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import { List } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Palette from 'Palette';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

import { AnnotationData, AnnotationRecord } from '../../common/src/types/AnnotationTypes';
import { formatDuration } from 'utils/DurationUtils';

import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import AnnotationsService from 'services/ProjectsService';
import { WithLogin, getTeacherColor } from 'types/Teacher';

const caretStart = require('./img/caret-start.png');
const caretStop = require('./img/caret-stop.png');

interface Props extends WithLogin {
  annotation?: AnnotationRecord;
  video: {
    position: number;
    duration: number;
  };
  projectId: string;
  updateCallback: Function;
  seekCallback: Function;
}

interface State {
  focused: boolean;
  annotation: AnnotationData | AnnotationData;
  startError?: string;
  isEditing: boolean;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  error?: string;
}

const decorate = withStyles(({ palette, spacing }) => ({
  transparent: {
    backgroundColor: 'rgba(0,0,0,0)'
  },
  white: {
    color: 'white'
  },
  lightGray: {
    color: '#CCC'
  },
  underline: {
    borderBottom: '1px solid white',
    '&:hover': {
      '&:before': {
        borderBottom: '1px solid white',
      },
      '&:after': {
        borderBottom: '1px solid white',
      }
    },
    '&:before': {
      borderBottom: '1px solid white',
    },
    '&:after': {
      borderBottom: '1px solid white',
    }
  },
  buttonRoot: {
    fontSize: 10,
    minWidth: 16,
    minHeight: 16,
    maxWidth: 16,
    maxHeight: 16,
    margin: 4,
    marginBottom: 6,
    padding: 0,
    color: 'lightGray',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  }
}));

const DEFAULT_ANNOTATION_DURATION = 60;

function maxAnnotationDuration(startTime: number, duration: number) {
  const stopTime = startTime + DEFAULT_ANNOTATION_DURATION;
  return (stopTime < duration ? stopTime : duration);
}

const Annotation = decorate<Props>(
  class extends React.Component<
    Props
    & WithStyles<'white' | 'transparent' | 'lightGray' | 'avatar' | 'underline' | 'buttonRoot'>,
    State
    > {

    constructor(props: Props
      & WithStyles<'white' | 'transparent' | 'lightGray' | 'avatar' | 'underline' | 'buttonRoot'>) {
      super(props);
      if (this.props.annotation) {
        this.state = {
          focused: false,
          isEditing: false,
          user: this.props.annotation.teacher,
          annotation: this.props.annotation as AnnotationRecord
        } as State;
      } else {
        this.state = {
          focused: true,
          isEditing: true,
          user: this.props.teacher,
          annotation: {
            text: '',
            startTime: this.props.video.position,
            stopTime: maxAnnotationDuration(this.props.video.position, this.props.video.duration),
            pause: false
          } as AnnotationData
        } as State;
      }
    }

    render() {
      const classes = this.props.classes;

      const avatarify = (label: string | undefined) =>
        label && label.length > 0 ?
          label.charAt(0).toUpperCase()
          : '';
      const user = this.state.user;
      const avatarLabel =
        user.firstName || user.lastName ?
          `${avatarify(user.firstName)}${avatarify(user.lastName)}`
          : avatarify(user.email);
      const formattedStart = formatDuration(this.state.annotation.startTime);
      const formattedStop = formatDuration(this.state.annotation.stopTime);

      return (
        <List>
          <ListItem
            onClick={() => this.setState({ focused: !this.state.focused })}
          >
            <ListItemAvatar>
              <Avatar
                style={{
                  backgroundColor: getTeacherColor(user.id)
                }}
              >
                {avatarLabel}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={this.state.isEditing ?
                <TextField
                  multiline={true}
                  InputLabelProps={{ classes: { root: classes.lightGray } }}
                  InputProps={{
                    classes: {
                      input: classes.transparent,
                      root: classes.white,
                      underline: classes.underline
                    }
                  }}
                  label="Ajoutez une annotation"
                  style={{ display: 'flex', flex: 1, color: 'white' }}
                  value={this.state.annotation.text}
                  onChange={event => {
                    const state = this.state;
                    state.annotation.text = event.target.value;
                    this.setState(state);
                  }}
                  error={this.state.error ? true : false}
                  helperText={this.state.error}
                /> :
                <Typography
                  className={classes.white}
                  style={this.state.focused ?
                    {} :
                    {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }
                >
                  {this.state.annotation.text}
                </Typography>

              }
              secondary={!this.state.isEditing &&
                <Typography variant="caption" className={classes.lightGray}>
                  {`${formattedStart} - ${formattedStop}`}
                </Typography>
              }
            />
            {(this.props.teacher && this.props.teacher.id === this.state.user.id) &&
              <ListItemSecondaryAction>
                <IconButton
                  color="primary"
                  onClick={() => {

                    if (this.state.isEditing) {
                      if (!this.props.annotation) {
                        AnnotationsService.createAnnotation(this.props.projectId, this.state.annotation)
                          .then(annotation => {
                            this.setState({
                              annotation,
                              error: undefined,
                              isEditing: !this.state.isEditing

                            });
                            this.props.updateCallback();
                          })
                          .catch(error => this.setState({ error: error.message }));
                      } else {
                        AnnotationsService.updateAnnotation(
                          this.props.projectId,
                          this.props.annotation.id,
                          this.state.annotation
                        )
                          .then((annotation: AnnotationRecord) => {
                            this.setState({
                              annotation,
                              error: undefined,
                              isEditing: !this.state.isEditing
                            });
                            this.props.updateCallback();
                          })
                          .catch((error: Error) => this.setState({ error: error.message }));
                      }
                    } else {
                      this.setState({
                        isEditing: !this.state.isEditing,
                      });
                    }
                  }}
                >
                  {this.state.isEditing ?
                    <AddIcon /> :
                    <EditIcon />
                  }
                </IconButton>
              </ListItemSecondaryAction>
            }
          </ListItem>
          {this.state.isEditing &&
            <ListItem style={{ paddingLeft: 72, paddingTop: 0 }}>
              <FormControlLabel
                classes={{
                  root: classes.lightGray,
                  label: classes.lightGray
                }}
                control={
                  <Checkbox
                    className={classes.lightGray}
                    checked={this.state.annotation.pause}
                    onChange={event => {
                      const state = this.state;
                      state.annotation.pause = event.target.checked;
                      this.setState(state);
                    }}
                  />
                }
                label="mettre en pause ?"
              />
              <Button
                classes={{ root: classes.buttonRoot }}
                size="small"
                variant="raised"
                onClick={event => {
                  const state = this.state as State;
                  state.annotation.startTime = Math.max(0, state.annotation.startTime - 1);
                  this.setState(state);
                  this.props.seekCallback(state.annotation.startTime);
                }}
              >
                {`◀`}
              </Button>
              <Typography
                className={classes.lightGray}
              >
                {formatDuration(this.state.annotation.startTime)}
              </Typography>
              <Button
                classes={{ root: classes.buttonRoot }}
                size="small"
                variant="raised"
                onClick={event => {
                  const state = this.state as State;
                  state.annotation.startTime = Math.min(state.annotation.stopTime, state.annotation.startTime + 1);
                  this.setState(state);
                  this.props.seekCallback(state.annotation.startTime);
                }}
              >
                {`▶`}
              </Button>
              <div style={{ padding: 8, flexGrow: 1 }}>
                <Range
                  min={0}
                  max={this.props.video.duration}
                  value={[this.state.annotation.startTime, this.state.annotation.stopTime]}
                  onChange={values => {
                    const state = this.state;
                    if (state.annotation.startTime !== values[0]) {
                      state.annotation.startTime = values[0];
                      this.props.seekCallback(state.annotation.startTime);
                    }
                    if (state.annotation.stopTime !== values[1]) {
                      state.annotation.stopTime = values[1];
                      this.props.seekCallback(state.annotation.stopTime);
                    }
                    this.setState(state);
                  }}
                  trackStyle={[{ backgroundColor: Palette.secondary }]}
                  handleStyle={[{
                    border: 0,
                    borderRadius: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    backgroundSize: 'cover',
                    width: 12,
                    height: 12,
                    marginTop: -11,
                    marginLeft: -5,
                    backgroundImage: `url(${caretStart})`
                  }, {
                    border: 0,
                    borderRadius: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    backgroundSize: 'cover',
                    width: 12,
                    height: 12,
                    marginTop: 3,
                    marginLeft: -6,
                    backgroundImage: `url(${caretStop})`
                  }]}
                  allowCross={false}
                />
              </div>
              <Button
                classes={{ root: classes.buttonRoot }}
                size="small"
                variant="raised"
                onClick={event => {
                  const state = this.state as State;
                  state.annotation.stopTime = Math.max(state.annotation.startTime, state.annotation.stopTime - 1);
                  this.setState(state);
                  this.props.seekCallback(state.annotation.stopTime);
                }}
              >
                {`◀`}
              </Button>
              <Typography
                className={classes.lightGray}
              >
                {formatDuration(this.state.annotation.stopTime)}
              </Typography>
              <Button
                classes={{ root: classes.buttonRoot }}
                size="small"
                variant="raised"
                onClick={event => {
                  const state = this.state as State;
                  state.annotation.stopTime = Math.min(state.annotation.stopTime + 1, this.props.video.duration);
                  this.setState(state);
                  this.props.seekCallback(state.annotation.stopTime);
                }}
              >
                {`▶`}
              </Button>
            </ListItem>
          }
        </List>
      );
    }
  }
);

export default Annotation;