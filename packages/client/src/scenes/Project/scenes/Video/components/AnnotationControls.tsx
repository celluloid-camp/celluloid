import * as React from 'react';
import { FormControlLabel, Checkbox, Button, Typography, IconButton } from '@material-ui/core';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import { formatDuration } from 'utils/DurationUtils';
import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import Palette from 'utils/PaletteUtils';

import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';

const caretStart = require('images/caret-start.png');
const caretStop = require('images/caret-stop.png');

const styles = createStyles({
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
  lightGray: {
    color: '#CCC'
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
  },
});

interface Props extends WithStyles<typeof styles> {
  startTime: number;
  stopTime: number;
  pause: boolean;
  duration: number;
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
    variant="raised"
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
      className={props.classes.lightGray}
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
  duration,
  pause,
  onCheckPauseChange,
  onTimingChange,
  onClickSave,
  onClickCancel,
  classes
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
    <>
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
            onChange={values => {
              if (startTime !== values[0]) {
                onTimingChange(values[0], true);
              } else if (stopTime !== values[1]) {
                onTimingChange(values[1], false);
              }
            }}
            trackStyle={[{ backgroundColor: Palette.secondary }]}
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
          classes={{
            root: classes.lightGray,
            label: classes.lightGray
          }}
          control={
            <Checkbox
              className={classes.lightGray}
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
          <ClearIcon />
        </IconButton>
        <IconButton
          color="primary"
          onClick={() => onClickSave()}
        >
          <CheckIcon />
        </IconButton>
      </div>
    </>
  );
});