import 'rc-slider/assets/index.css';

import { deepOrange } from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AnnotationIcon from '@material-ui/icons/Comment';
import FullScreenEnterIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import PauseIcon from '@material-ui/icons/Pause';
import PlayIcon from '@material-ui/icons/PlayArrow';
import Slider from 'rc-slider';
import * as React from 'react';
import { formatDuration } from 'utils/DurationUtils';

const styles = createStyles({
  controls: {
    transition: 'all 0.5s ease',
    width: '100%',
    height: '100%',
    bottom: 0,
    margin: 0,
    padding: 0,
  },
  icon: {
    height: 32,
    width: 32
  },
  slider: {
    paddingTop: 6
  }
});

interface Props extends WithStyles<typeof styles> {
  playing: boolean;
  duration: number;
  position: number;
  show: boolean;
  fullscreen: boolean;
  onSeek(position: number, pause: boolean): void;
  onTogglePlayPause(): void;
  onToggleFullscreen(): void;
  onToggleHints(): void;
}

export default withStyles(styles)(({
  playing,
  duration,
  position,
  show,
  fullscreen,
  onTogglePlayPause,
  onToggleFullscreen,
  onToggleHints,
  onSeek,
  classes,
}: Props) => (
    <Grid
      container={true}
      direction="row"
      spacing={24}
      justify="space-between"
      alignItems="center"
      className={classes.controls}
    >
      <Grid item={true}>
        <IconButton
          color="inherit"
          onClick={() => onTogglePlayPause()}
          classes={{ root: classes.icon }}
        >
          {playing ?
            <PauseIcon /> :
            <PlayIcon />
          }
        </IconButton>
      </Grid>
      <Grid item={true}>
        <Typography
          style={{ color: 'white' }}
          variant="caption"
        >
          {formatDuration(position)}
        </Typography>
      </Grid>
      <Grid item={true} style={{ flexGrow: 1 }}>
        <Grid
          container={true}
          direction="column"
        >
          <Grid item={true} style={{ flexGrow: 1 }}>
            <Slider
              className={classes.slider}
              min={0}
              max={duration}
              value={position}
              trackStyle={[{
                border: 0,
                borderRadius: 0,
                backgroundColor: deepOrange[600],
                height: 2
              }]}
              railStyle={{
                height: 2,
                borderRadius: 0,
                backgroundColor: deepOrange['100'],
                border: 0
              }}
              handleStyle={[{
                transitionProperty: 'all',
                marginLeft: -6,
                border: 0,
                height: 12, width: 12,
                backgroundColor: deepOrange[500]
              }]}
              onChange={value =>
                onSeek(value, false)
              }
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item={true}>
        <Typography
          style={{ color: 'white' }}
          variant="caption"
        >
          {formatDuration(duration)}
        </Typography>
      </Grid>
      <Grid item={true}>
        <IconButton
          color={!show ? 'primary' : 'secondary'}
          onClick={() => onToggleHints()}
          classes={{ root: classes.icon }}
        >
          <AnnotationIcon />
        </IconButton>
      </Grid>
      <Grid item={true}>
        <IconButton
          color="inherit"
          onClick={() => onToggleFullscreen()}
          classes={{ root: classes.icon }}
        >
          {fullscreen ?
            <FullscreenExitIcon /> :
            <FullScreenEnterIcon />
          }
        </IconButton>
      </Grid>
    </Grid>
  ));