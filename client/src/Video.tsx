
import * as React from 'react';

import { ProjectData } from './types/Project';
import { RouteComponentProps } from 'react-router';

import ProjectsService from './services/Projects';

import YouTube, { } from 'react-youtube';

import { withStyles } from 'material-ui/styles';
import { WithStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';

import AnnotationIcon from 'material-ui-icons/Announcement';
import PlayIcon from 'material-ui-icons/PlayArrow';
import PauseIcon from 'material-ui-icons/Pause';
import FullScreenEnterIcon from 'material-ui-icons/Fullscreen';
import FullscreenExitIcon from 'material-ui-icons/FullscreenExit';
import IconButton from 'material-ui/IconButton';

import Fullscreen from 'react-full-screen';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface ProjectParams {
  projectId: string;
}

interface Props extends RouteComponentProps<ProjectParams> {
}

enum PlayerState {
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 4
}

const decorate = withStyles(({ palette, spacing }) => ({
  videoContainer: {
    border: 0,
    position: 'relative' as 'relative',
    height: 0,
    width: '100%',
    paddingBottom: '56.25%',
  },
  videoIframe: {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 0
  },
  annotationFrame: {
    verticalAlign: 'middle',
    textAlign: 'left',
    color: 'white',
    position: 'absolute' as 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 56,
    zIndex: 1,
    // margin: -1,
    // border: '1px solid red',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  controls: {
    width: '100%',
    height: 56,
    margin: 0,
    // border: '1px solid green',
    padding: 0,
    paddingRight: 130
  },
  icon: {
    height: 32,
    width: 32
  }
}));

interface State {
  project?: ProjectData;
  error?: string;
  position: number;
  duration: number;
  formattedDuration: string;
  player?: Player;
  fullscreen: boolean;
  playing: boolean;
}

interface Player {
  getCurrentTime: Function;
  getDuration: Function;
  playVideo: Function;
  pauseVideo: Function;
  seekTo: Function;
}

function formatDuration(duration: number) {
  const seconds = Math.floor(duration % 60);
  const minutes = Math.floor(duration / 60) % 60;
  const hours = Math.floor(duration / 3600);
  const strSeconds = seconds >= 10 ? `${seconds}` : `0${seconds}`;
  const strMinutes = minutes >= 10 ? `${minutes}` : `0${minutes}`;
  const formatted = `${strMinutes}:${strSeconds}`;
  if (hours) {
    return `${hours}:${formatted}`;
  } else {
    return formatted;
  }
}

const Video = decorate<{}>(
  class extends React.Component<
    Props
    & WithStyles<'annotationFrame' | 'videoIframe' | 'videoContainer' | 'controls' | 'icon'>,
    State> {

    intervalId = -1;
    state = {
      position: 0,
      duration: 0,
      fullscreen: false,
      playing: false,
    } as State;

    timer() {
      const player = this.state.player;
      const position = player ? player.getCurrentTime() : 0;
      const duration = player ? player.getDuration() : 0;
      this.setState({
        position,
        duration,
      });
    }

    componentWillUnmount() {
      clearInterval(this.intervalId);
    }

    componentWillMount() {
      const projectId = this.props.match.params.projectId;

      ProjectsService.get(projectId)
        .then((project: ProjectData) => {
          this.setState({ project });
        })
        .catch(error => {
          this.setState({ error: error.message });
        });
    }
    render() {
      const videoLoaded = (event: { target: Player }) => {
        const player = event.target;
        this.intervalId = setInterval(this.timer.bind(this), 1000);
        this.setState({ player });
      };

      const videoStateChanged = (event: { target: Player, data: number }) => {
        const state = event.data as PlayerState;

        switch (state) {
          case PlayerState.PLAYING:
          case PlayerState.BUFFERING:
          case PlayerState.CUED:
            this.setState({ playing: true });
            break;
          default:
            this.setState({ playing: false });
        }
      };

      const toggleFullscreen = () => {
        this.setState({ fullscreen: !this.state.fullscreen });
      };

      const togglePlay = () => {
        if (this.state.player) {
          if (this.state.playing) {
            this.state.player.pauseVideo();
          } else {
            this.state.player.playVideo();
          }
        }
      };

      const classes = this.props.classes;
      return (
        <Fullscreen
          enabled={this.state.fullscreen}
          onChange={fullscreen => this.setState({ fullscreen })}
        >
          <div className={[classes.videoContainer, 'full-screenable-node'].join(' ')}>
            {this.state.project ?
              <div>
                <YouTube
                  videoId={this.state.project.videoId}
                  opts={{
                    playerVars: {
                      modestbranding: 1,
                      rel: 0,
                      start: 0,
                      showinfo: 0,
                      iv_load_policy: 3,
                      controls: 0
                    }
                  }}
                  className={classes.videoIframe}
                  onReady={videoLoaded}
                  onStateChange={videoStateChanged}
                />
                <div className={classes.annotationFrame}>
                  <Grid
                    container={true}
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                    className={classes.controls}
                  >
                    <Grid
                      item={true}
                    >
                      <IconButton
                        color="inherit"
                        onClick={toggleFullscreen}
                        classes={{ icon: classes.icon }}
                      >
                        <AnnotationIcon />
                      </IconButton>
                    </Grid>
                    <Grid
                      item={true}
                    >
                      <IconButton
                        color="inherit"
                        onClick={togglePlay}
                        classes={{ icon: classes.icon }}
                      >
                        {this.state.playing ?
                          <PauseIcon /> :
                          <PlayIcon />
                        }
                      </IconButton>
                    </Grid>
                    <Grid
                      item={true}
                      style={{ flexGrow: 1 }}
                    >
                      <Slider
                        min={0}
                        max={this.state.duration}
                        value={this.state.position}
                        trackStyle={[{ backgroundColor: 'orange' }]}
                        handleStyle={[{ borderColor: 'orange' }, { borderColor: 'orange' }]}
                        onChange={value => {
                          // tslint:disable-next-line:no-console
                          console.log(`during: ${formatDuration(value)}`);
                          if (this.state.player) {
                            this.state.player.seekTo(value, false);
                            this.setState({ position: value });
                          }
                        }}
                        onAfterChange={value => {
                          // tslint:disable-next-line:no-console
                          console.log(`after: ${formatDuration(value)}`);
                          if (this.state.player) {
                            this.state.player.seekTo(value, true);
                            this.setState({ position: value });
                          }
                        }}
                      />
                    </Grid>
                    <Grid
                      item={true}
                    >
                      <Typography
                        style={{ color: 'white' }}
                        type="caption"
                      >
                        {`${formatDuration(this.state.position)} / ${formatDuration(this.state.duration)}`}
                      </Typography>
                    </Grid>
                    <Grid
                      item={true}
                    >
                      <IconButton
                        color="inherit"
                        onClick={toggleFullscreen}
                        classes={{ icon: classes.icon }}
                      >
                        {this.state.fullscreen ?
                          <FullscreenExitIcon /> :
                          <FullScreenEnterIcon />
                        }
                      </IconButton>
                    </Grid>
                  </Grid>
                </div>
              </div>
              : <div />
            }
          </div>
        </Fullscreen>
      );
    }
  }
);

export default Video;