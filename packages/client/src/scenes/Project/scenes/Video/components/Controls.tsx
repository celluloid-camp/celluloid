import "rc-slider/assets/index.css";

import { AnnotationRecord, UserRecord } from "@celluloid/types";
import AnnotationIcon from "@mui/icons-material/Comment";
import FullScreenEnterIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import PauseIcon from "@mui/icons-material/Pause";
import PlayIcon from "@mui/icons-material/PlayArrow";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { Badge, Grid, IconButton, Typography } from "@mui/material";
import Slider from "rc-slider";
import * as React from "react";
import { connect } from "react-redux";

import { AppState } from "~types/StateTypes";
import { formatDuration } from "~utils/DurationUtils";
import {
  sliderHandleStyle,
  sliderRailStyle,
  sliderTrackStyle,
} from "~utils/SliderUtils";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     badge: {
//       top: spacing.unit,
//       right: spacing.unit,
//     },
//     controls: {
//       transition: "all 0.5s ease",
//       width: "100%",
//       height: "100%",
//       bottom: 0,
//       margin: 0,
//       padding: 0,
//     },
//     icon: {
//       padding: 0,
//       height: 32,
//       width: 32,
//     },
//     slider: {
//       paddingTop: 6,
//     },
//   });

interface Props {
  user?: UserRecord;
  annotations: AnnotationRecord[];
  playing: boolean;
  seeking: boolean;
  seekTarget: number;
  duration: number;
  position: number;
  fullscreen: boolean;
  muted: boolean;
  onSeek(position: number, pause: boolean, seekAhead: boolean): void;
  onTogglePlayPause(): void;
  onToggleFullscreen(): void;
  onToggleHints(): void;
  onToggleMuted(): void;
}

interface State {
  seekTarget: number;
}

const mapStateToProps = (state: AppState) => ({
  seeking: state.project.player.seeking,
  seekTarget: state.project.player.seekTarget,
});

export default connect(mapStateToProps)(
  class extends React.Component<Props, State> {
    render() {
      const {
        user,
        annotations,
        playing,
        duration,
        position,
        fullscreen,
        muted,
        onTogglePlayPause,
        onToggleFullscreen,
        onToggleHints,
        onSeek,
        onToggleMuted,
        seeking,
        seekTarget,
      } = this.props;

      return (
        <Grid
          container={true}
          // direction="row"
          spacing={24}
          // justify="space-between"
          // alignItems="center"
          sx={{
            transition: "all 0.5s ease",
            width: "100%",
            height: "100%",
            bottom: 0,
            margin: 0,
            padding: 0,
          }}
        >
          <Grid item={true}>
            <IconButton
              color="inherit"
              onClick={() => onTogglePlayPause()}
              sx={{
                padding: 0,
                height: 32,
                width: 32,
              }}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
          </Grid>
          <Grid item={true}>
            <Typography style={{ color: "white" }} variant="caption">
              {formatDuration(seeking ? seekTarget : position)}
            </Typography>
          </Grid>
          <Grid item={true} style={{ flexGrow: 1 }}>
            <Grid container={true} direction="column">
              <Grid item={true} style={{ flexGrow: 1 }}>
                <Slider
                  style={{
                    paddingTop: 6,
                  }}
                  min={0}
                  max={duration}
                  value={seeking ? seekTarget : position}
                  trackStyle={sliderTrackStyle}
                  railStyle={sliderRailStyle}
                  handleStyle={[sliderHandleStyle]}
                  onChange={(value) => {
                    onSeek(value, false, false);
                  }}
                  onAfterChange={(value) => {
                    onSeek(value, false, true);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item={true}>
            <Typography style={{ color: "white" }} variant="caption">
              {formatDuration(duration)}
            </Typography>
          </Grid>

          <Grid item={true}>
            {user && (
              <IconButton
                color="secondary"
                onClick={() => onToggleHints()}
                sx={{
                  padding: 0,
                  height: 32,
                  width: 32,
                }}
              >
                <Badge badgeContent={annotations.length} color="primary">
                  <AnnotationIcon />
                </Badge>
              </IconButton>
            )}

            <IconButton
              color="inherit"
              onClick={() => onToggleMuted()}
              sx={{
                padding: 0,
                height: 32,
                width: 32,
              }}
            >
              {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => onToggleFullscreen()}
              sx={{
                padding: 0,
                height: 32,
                width: 32,
              }}
            >
              {fullscreen ? <FullscreenExitIcon /> : <FullScreenEnterIcon />}
            </IconButton>
          </Grid>
        </Grid>
      );
    }
  }
);
