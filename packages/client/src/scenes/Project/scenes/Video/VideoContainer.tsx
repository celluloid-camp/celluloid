import * as React from 'react';
import * as classNames from 'classnames';
import { RouteComponentProps } from 'react-router';

import {
  WithStyles,
  withStyles,
  Zoom,
  Button,
  Collapse
} from '@material-ui/core';

import YouTube from 'react-youtube';

import EditIcon from '@material-ui/icons/Edit';

import Fullscreen from 'react-full-screen';
import 'rc-slider/assets/index.css';

import {
  AnnotationRecord,
  AnnotationData,
  ProjectData
} from '@celluloid/commons';
import { WithUser } from 'types/UserTypes';
import Annotation from './components/Annotation';
import AnnotationHints from './components/AnnotationHints';
import * as AnnotationUtils from 'utils/AnnotationUtils';
import { videoStyles } from './VideoStyles';
import Controls from './components/Controls';
import { TransitionGroup } from 'react-transition-group';

interface ProjectParams {
  projectId: string;
}

interface Props extends
  RouteComponentProps<ProjectParams>,
  WithStyles<typeof videoStyles>,
  WithUser {
  annotations: Set<AnnotationRecord>;
  project?: ProjectData;
  onChange: Function;
}

enum PlayerState {
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 4
}

const ANNOTATION_TIMEOUT = 5000;

interface State {
  visibleAnnotations: Set<AnnotationRecord>;
  error?: string;
  position: number;
  duration: number;
  formattedDuration: string;
  player?: Player;
  fullscreen: boolean;
  playing: boolean;
  userActive: boolean;
  showHints: boolean;
  focusedAnnotation?: string;
  isAddingAnnotation: boolean;
}

interface Player {
  getCurrentTime: Function;
  getDuration: Function;
  playVideo: Function;
  pauseVideo: Function;
  seekTo: Function;
}

const Video = withStyles(videoStyles)(
  class extends React.Component<Props, State> {
    fadeoutTimer = -1;
    refreshTimer = -1;
    state = {
      position: 0,
      duration: 0,
      fullscreen: false,
      playing: false,
      userActive: true,
      showHints: false,
      isAddingAnnotation: false,
      visibleAnnotations: new Set(),
    } as State;

    refreshPlayer() {
      const player = this.state.player;
      const position = player ? player.getCurrentTime() : 0;
      const duration = player ? player.getDuration() : 0;
      const annotations = this.props.annotations;
      const visibleAnnotations = new Set(
        Array
          .from(annotations.values())
          .filter(annotation =>
            AnnotationUtils.visible(annotation, this.state.position)
          )
      );
      visibleAnnotations.forEach(annotation => {
        if (annotation.pause
          && !this.state.visibleAnnotations.has(annotation)
          && this.state.player) {
          this.state.player.pauseVideo();
        }
      });
      this.setState(state => ({
        ...state,
        visibleAnnotations,
        position,
        duration
      }));
    }

    resetFadeOutTimer() {
      this.setState({
        userActive: true,
      });
      clearInterval(this.fadeoutTimer);
      this.fadeoutTimer = setInterval(this.fadeOutControls.bind(this), ANNOTATION_TIMEOUT);
    }

    fadeOutControls() {
      this.setState({
        userActive: false
      });
    }

    seek(value: number) {
      const player = this.state.player;
      if (player) {
        player.seekTo(value);
      }
    }

    componentWillUnmount() {
      clearInterval(this.refreshTimer);
      clearInterval(this.fadeoutTimer);
    }

    componentDidMount() {
      this.resetFadeOutTimer();
    }

    render() {
      const onUserAction = this.resetFadeOutTimer.bind(this);

      const onPlayerReady = (event: { target: Player }) => {
        const player = event.target;
        this.refreshTimer = setInterval(this.refreshPlayer.bind(this), 1000);
        this.setState({ player });
      };

      const onPlayerStateChange = (event: { target: Player, data: number }) => {
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

      const onTogglePlayPause = () => {
        if (this.state.player) {
          if (this.state.playing) {
            this.state.player.pauseVideo();
          } else {
            this.state.player.playVideo();
          }
        }
      };

      const onVideoClick = () => {
        onUserAction();
        onTogglePlayPause();
      };

      const onAnnotationChange = () => {
        this.setState({
          isAddingAnnotation: false
        });
        this.props.onChange();
      };

      const onCancelAddAnnotation = () => {
        this.setState({
          isAddingAnnotation: false
        });
      };

      const classes = this.props.classes;

      const onSeek = this.seek.bind(this);

      const onAnnotationSeek = (position: number) => {
        if (this.state.player) {
          this.state.player.pauseVideo();
          onSeek(position);
        }
      };

      const controlsOpacity = this.state.userActive || this.state.showHints ?
        classes.visible : classes.hidden;

      const hintBoxHeight = this.state.showHints ?
        classes.hintBoxExpanded : classes.hintBoxCollapsed;

      return (
        <Fullscreen
          enabled={this.state.fullscreen}
          onChange={fullscreen => this.setState({ fullscreen })}
        >
          <div
            className={classNames(
              'full-screenable-node',
              classes.videoWrapper
            )}
          >
            {this.props.project &&
              <div>
                <YouTube
                  videoId={this.props.project.videoId}
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
                  onReady={onPlayerReady}
                  onStateChange={onPlayerStateChange}
                />
                <div
                  className={classes.glassPane}
                  onMouseMove={onUserAction}
                  onClick={onVideoClick}
                />
                {!this.state.showHints &&
                  <div
                    className={classes.annotationFrame}
                    onMouseMove={onUserAction}
                  >
                    <TransitionGroup appear={true}>
                      {Array.from(this.state.visibleAnnotations.values())
                        .map(annotation =>
                          <Collapse
                            appear={true}
                            in={true}
                            key={annotation.id}
                          >
                            <Annotation
                              user={annotation.teacher}
                              annotation={annotation}
                              video={{
                                position: this.state.position,
                                duration: this.state.duration
                              }}
                              projectId={this.props.match.params.projectId}
                              onSave={onAnnotationChange}
                              onSeek={onAnnotationSeek}
                              onCancel={() => null}
                            />
                          </Collapse>
                        )
                      }
                      {this.props.user && this.state.isAddingAnnotation &&
                        <Collapse
                          appear={true}
                          key="new"
                          in={this.state.isAddingAnnotation}
                        >
                          <Annotation
                            user={{
                              id: this.props.user.id,
                              email: this.props.user.email,
                              username: this.props.user.username
                            }}
                            video={{
                              position: this.state.position,
                              duration: this.state.duration
                            }}
                            projectId={this.props.match.params.projectId}
                            onSave={onAnnotationChange}
                            onSeek={onAnnotationSeek}
                            onCancel={onCancelAddAnnotation}
                          />
                        </Collapse>
                      }
                    </TransitionGroup>
                  </div>
                }
                {this.props.user && !this.state.isAddingAnnotation &&
                  <Zoom
                    appear={true}
                    in={!this.state.isAddingAnnotation}
                  >
                    <Button
                      color="secondary"
                      variant="fab"
                      className={classes.annotateButton}
                      style={{
                        opacity: this.state.userActive || this.state.isAddingAnnotation
                          ? 1 : 0
                      }}
                      onClick={() => {
                        this.setState({ isAddingAnnotation: !this.state.isAddingAnnotation });
                      }}
                    >
                      <EditIcon />
                    </Button>
                  </Zoom>
                }
                <div
                  onMouseMove={onUserAction}
                  className={classNames(classes.hintBox, controlsOpacity, hintBoxHeight)}
                >
                  <AnnotationHints
                    duration={this.state.duration}
                    position={this.state.position}
                    annotations={this.props.annotations}
                    visible={this.state.showHints}
                    onClick={(annotation: AnnotationData) => () => {
                      this.setState({
                        position: annotation.startTime,
                        showHints: false
                      });
                      this.refreshPlayer();
                      onSeek(annotation.startTime);
                    }}
                  />
                </div>
                <div
                  onMouseMove={onUserAction}
                  className={classNames([classes.controlFrame, controlsOpacity])}
                >
                  <Controls
                    show={this.state.showHints}
                    position={this.state.position}
                    duration={this.state.duration}
                    fullscreen={this.state.fullscreen}
                    playing={this.state.playing}
                    onSeekChange={value => {
                      this.setState({ position: value });
                    }}
                    onSeekAfterChange={value => onSeek(value)}
                    onToggleFullscreen={() => this.setState(prevState => ({
                      ...prevState,
                      fullscreen: !prevState.fullscreen
                    }))}
                    onTogglePlayPause={() => onTogglePlayPause()}
                    onToggleAnnotationHints={() => this.setState(prevState => ({
                      ...prevState,
                      showHints: !this.state.showHints
                    }))}
                  />
                </div>
              </div>
            }
          </div>
        </Fullscreen>
      );
    }
  }
);

export default Video;