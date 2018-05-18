import * as React from 'react';

import TextField from 'material-ui/TextField';
import Avatar from 'material-ui/Avatar';
import { ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import { withStyles, WithStyles } from 'material-ui/styles';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import Typography from 'material-ui/Typography';
import {
  FormControlLabel,
} from 'material-ui/Form';
import deepOrange from 'material-ui/colors/deepOrange';

import AddIcon from 'material-ui-icons/Add';
import EditIcon from 'material-ui-icons/Edit';

import { AnnotationData } from '../../common/src/types/Annotation';
import { formatDuration } from './utils/DurationUtils';

import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import AnnotationsService from './services/Projects';
import { MaybeWithTeacher } from './types/Teacher';

const caretStart = require('./img/caret-start.png');
const caretStop = require('./img/caret-stop.png');

const randomColor = require('randomcolor');

interface Props extends MaybeWithTeacher {
  annotation?: AnnotationData;
  video: {
    position: number;
    duration: number;
  };
  projectId: string;
}

interface State {
  annotation: AnnotationData;
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
  white: {
    color: 'white'
  },
  lightGray: {
    color: '#CCC'
  },
  underline: {
    '&:hover:before': {
      backgroundColor: ['#CCC', '!important']
    },
    '&:before': {
      backgroundColor: '#CCC'
    }
  },
  avatar: {
    margin: 10,
    color: '#fff',
    backgroundColor: deepOrange[500]
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

const DEFAULT_ANNOTATION_DURATION = 60

function maxAnnotationDuration(startTime: number, duration: number) {
  const stopTime = startTime + DEFAULT_ANNOTATION_DURATION;
  return (stopTime < duration ? stopTime : duration);
}

const Annotation = decorate<Props>(
  class extends React.Component<
    Props
    & WithStyles<'white' | 'lightGray' | 'avatar' | 'underline' | 'buttonRoot'>,
    State
    > {

    constructor(props: Props
      & WithStyles<'white' | 'lightGray' | 'avatar' | 'underline' | 'buttonRoot'>) {
      super(props);
      console.log(this.props.teacher);
      if (this.props.annotation) {
        this.state = {
          isEditing: false,
          user: this.props.teacher,
          annotation: this.props.annotation
        } as State;
      } else {
        this.state = {
          isEditing: true,
          user: this.props.teacher,
          annotation: {
            text: '',
            startTime: this.props.video.position,
            stopTime: maxAnnotationDuration(this.props.video.position, this.props.video.duration),
            pause: false
          }
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

      return (
        <div>
          <ListItem>
            <ListItemAvatar>
              <Avatar
                style={{
                  backgroundColor: randomColor({
                    seed: user.id,
                    luminosity: 'bright'
                  })
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
                <Typography className={classes.white}>
                  {this.state.annotation.text}
                </Typography>

              }
            />
            <ListItemSecondaryAction>
              <IconButton
                color="primary"
                onClick={() => {
                  if (this.state.isEditing) {
                    if (!this.props.annotation) {
                      AnnotationsService.createAnnotation(this.props.projectId, this.state.annotation)
                        .then(annotation => this.setState({
                          annotation,
                          error: undefined,
                          isEditing: !this.state.isEditing
                        }))
                        .catch(error => this.setState({ error: error.message }));
                    } else {
                      AnnotationsService.updateAnnotation(this.props.projectId, this.state.annotation)
                        .then(annotation => this.setState({
                          annotation,
                          error: undefined,
                          isEditing: !this.state.isEditing
                        }))
                        .catch(error => this.setState({ error: error.message }));
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
                dense={true}
                raised={true}
                onClick={event => {
                  const state = this.state as State;
                  state.annotation.startTime = Math.max(0, state.annotation.startTime - 1);
                  this.setState(state);
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
                dense={true}
                raised={true}
                onClick={event => {
                  const state = this.state as State;
                  state.annotation.startTime = Math.min(state.annotation.stopTime, state.annotation.startTime + 1);
                  this.setState(state);
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
                    state.annotation.startTime = values[0];
                    state.annotation.stopTime = values[1];
                    this.setState(state);
                  }}
                  trackStyle={[{ backgroundColor: 'orange' }]}
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
                dense={true}
                raised={true}
                onClick={event => {
                  const state = this.state as State;
                  state.annotation.stopTime = Math.max(state.annotation.startTime, state.annotation.stopTime - 1);
                  this.setState(state);
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
                dense={true}
                raised={true}
                onClick={event => {
                  const state = this.state as State;
                  state.annotation.stopTime = Math.min(state.annotation.stopTime + 1, this.props.video.duration);
                  this.setState(state);
                }}
              >
                {`▶`}
              </Button>
            </ListItem>
          }
        </div>
      );
    }
  }
);

export default Annotation;