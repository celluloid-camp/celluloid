import * as React from 'react';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Slider from 'rc-slider';
import Typography from '@material-ui/core/Typography';

import AnnotationIcon from '@material-ui/icons/Comment';
import PlayIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import FullScreenEnterIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

import { formatDuration } from 'utils/DurationUtils';
import Palette from 'utils/PaletteUtils';

const styles = createStyles({
  controls: {
    transition: 'all 0.5s ease',
    width: '100%',
    height: '100%',
    bottom: 0,
    margin: 0,
    padding: 0,
    paddingRight: 130
  },
  icon: {
    height: 32,
    width: 32
  },
});

interface Props extends WithStyles<typeof styles> {
  playing: boolean;
  duration: number;
  position: number;
  show: boolean;
  fullscreen: boolean;
  onSeekChange(position: number): void;
  onSeekAfterChange(position: number): void;
  onTogglePlayPause(): void;
  onToggleFullscreen(): void;
  onToggleAnnotationHints(): void;
}

export default withStyles(styles)(({
  classes,
  playing,
  duration,
  position,
  show,
  fullscreen,
  onSeekChange,
  onSeekAfterChange,
  onTogglePlayPause,
  onToggleFullscreen,
  onToggleAnnotationHints
}: Props) => (

    <Grid
      container={true}
      direction="row"
      spacing={24}
      justify="space-between"
      alignItems="center"
      className={classes.controls}
    >
      <Grid
        item={true}
      >
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
      <Grid
        item={true}
        style={{ flexGrow: 1 }}
      >
        <Grid
          container={true}
          direction="column"
        >
          <Grid
            item={true}
            style={{ flexGrow: 1 }}
          >
            <Slider
              min={0}
              max={duration}
              value={position}
              trackStyle={[{ backgroundColor: Palette.secondary }]}
              handleStyle={{
                borderColor: Palette.secondary
              }}
              onChange={value => onSeekChange(value)}
              onAfterChange={value => {
                onSeekAfterChange(value);
              }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid
        item={true}
      >
        <Typography
          style={{ color: 'white' }}
          variant="caption"
        >
          {`${formatDuration(position)} / ${formatDuration(duration)}`}
        </Typography>
      </Grid>
      <Grid
        item={true}
      >
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
      <Grid
        item={true}
      >
        <IconButton
          color={show ? 'primary' : 'secondary'}
          onClick={() => onToggleAnnotationHints()}
          classes={{ root: classes.icon }}
        >
          <AnnotationIcon />
        </IconButton>
      </Grid>
    </Grid>
  ));