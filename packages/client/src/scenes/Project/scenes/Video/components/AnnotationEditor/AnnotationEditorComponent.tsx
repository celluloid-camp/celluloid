import 'rc-slider/assets/index.css';

import {
  Button,
  Checkbox,
  createStyles,
  Fade,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Input,
  Theme,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core';
import { deepOrange } from '@material-ui/core/colors';
import CheckIcon from '@material-ui/icons/Check';
import CancelIcon from '@material-ui/icons/Clear';
import classnames from 'classnames';
import { Range } from 'rc-slider';
import * as React from 'react';
import { formatDuration } from 'utils/DurationUtils';

const caretStart = require('images/caret-start.png');
const caretStop = require('images/caret-stop.png');

const styles = (theme: Theme) => createStyles({
  root: {
    paddingLeft: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  content: {
    flex: '1 1 auto',
    minWidth: 0,
    padding: `0 ${theme.spacing.unit * 2}px`,
    '&:first-child': {
      paddingLeft: 0,
    },
    margin: 10,
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonRoot: {
    fontSize: 10,
    lineHeight: '20px',
    minWidth: 20,
    minHeight: 20,
    maxWidth: 20,
    maxHeight: 20,
    margin: 4,
    marginBottom: 7,
    padding: 0,
    borderRadius: '50%'
  },
  inputWrapper: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    display: 'flex',
    flex: 1,
    borderRadius: 2,
    position: 'relative',
    transition: 'all 0.1s ease-out'
  },
  inputOk: {
    marginBottom: 0,
  },
  inputError: {
    marginBottom: theme.spacing.unit * 2
  },
  inputRoot: {
    fontSize: theme.typography.body1.fontSize,
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    color: 'inherit',
  },
  inputInput: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    marginRight: theme.spacing.unit * 2,
    boxSizing: 'border-box'
  },
  inputHelper: {
    position: 'absolute',
    left: theme.spacing.unit,
    bottom: -theme.spacing.unit,
  }
});

interface Props extends WithStyles<typeof styles> {
  startTime: number;
  stopTime: number;
  pause: boolean;
  text: string;
  duration: number;
  error?: string;
  onTextChange(text: string): void;
  onCheckPauseChange(value: boolean): void;
  onTimingChange(value: number, isStart: boolean): void;
  onClickSave(): void;
  onClickCancel(): void;
}

interface TimingButtonProps extends WithStyles<typeof styles> {
  forward: boolean;
  onSeek(): void;
}

interface TimingControlProps extends WithStyles<typeof styles> {
  position: number;
  onBack(): void;
  onForward(): void;
}

const TimingButton = (props: TimingButtonProps) => (
  <Button
    classes={{ root: props.classes.buttonRoot }}
    size="small"
    onClick={() => {
      props.onSeek();
    }}
  >
    {!props.forward ? `◀` : `▶`}
  </Button>
);

const TimingControl = (props: TimingControlProps) => (
  <>
    <TimingButton
      forward={false}
      onSeek={props.onBack}
      classes={props.classes}
    />
    <Typography
      variant="caption"
    >
      {formatDuration(props.position)}
    </Typography >
    <TimingButton
      forward={true}
      onSeek={props.onForward}
      classes={props.classes}
    />
  </>
);

export default withStyles(styles)(({
  startTime,
  stopTime,
  pause,
  text,
  duration,
  error,
  onCheckPauseChange,
  onTimingChange,
  onTextChange,
  onClickSave,
  onClickCancel,
  classes,
}: Props) => {
  const handleStyles = {
    border: 0,
    borderRadius: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    backgroundSize: 'cover',
    width: 12,
    height: 12,
  };

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div
          className={classnames(
            error ? classes.inputError : classes.inputOk,
            classes.inputWrapper
          )}
        >
          <Input
            multiline={true}
            disableUnderline={true}
            autoFocus={true}
            placeholder="Saisissez votre annotation…"
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
            value={text}
            error={Boolean(error)}
            fullWidth={true}
            onChange={event => onTextChange(event.target.value)}
          />
          <Fade in={Boolean(error)} appear={true}>
            <FormHelperText
              className={classes.inputHelper}
              error={true}
            >
              {error}
            </FormHelperText>
          </Fade>
        </div>
        <div className={classes.timeline}>
          <TimingControl
            onBack={() =>
              onTimingChange(Math.max(0, startTime - 1), true)
            }
            onForward={() =>
              onTimingChange(Math.min(stopTime, startTime + 1), true)
            }
            position={startTime}
            classes={classes}
          />
          <div style={{ padding: 8, flexGrow: 1 }}>
            <Range
              min={0}
              max={duration}
              value={[startTime, stopTime]}
              onAfterChange={values => {
                if (startTime !== values[0]) {
                  onTimingChange(values[0], true);
                } else if (stopTime !== values[1]) {
                  onTimingChange(values[1], false);
                }
              }}
              trackStyle={[{
                border: 0,
                borderRadius: 0,
                backgroundColor: deepOrange[500],
                height: 2
              }]}
              railStyle={{
                height: 2,
                borderRadius: 0,
                backgroundColor: deepOrange['100'],
                border: 0
              }}
              handleStyle={[{
                ...handleStyles,
                marginTop: -11,
                marginLeft: -5,
                backgroundImage: `url(${caretStart})`
              }, {
                ...handleStyles,
                marginTop: 3,
                marginLeft: -6,
                backgroundImage: `url(${caretStop})`
              }]}
              allowCross={false}
            />
          </div>
          <TimingControl
            onBack={() =>
              onTimingChange(Math.max(startTime, stopTime - 1), false)
            }
            onForward={() =>
              onTimingChange(Math.min(stopTime + 1, duration), false)
            }
            position={stopTime}
            classes={classes}
          />
        </div>
        <div className={classes.buttons}>
          <FormControlLabel
            control={
              <Checkbox
                checked={pause}
                onChange={event =>
                  onCheckPauseChange(event.target.checked)
                }
              />
            }
            label="mettre en pause ?"
          />
          <IconButton
            color="secondary"
            onClick={() => onClickCancel()}
          >
            <CancelIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => onClickSave()}
          >
            <CheckIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
});