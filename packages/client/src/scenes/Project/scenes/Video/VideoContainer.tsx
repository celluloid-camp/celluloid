import { AnnotationRecord, ProjectGraphRecord, UserRecord } from '@celluloid/types';
import { listAnnotationsThunk } from 'actions/AnnotationsActions';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AsyncAction } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';
import { Player, PlayerState } from 'types/YoutubeTypes';
import * as AnnotationUtils from 'utils/AnnotationUtils';

import VideoComponent from './VideoComponent';

const FADE_TIMEOUT = 3000;

interface Props {
  user?: UserRecord;
  annotations: Set<AnnotationRecord>;
  project: ProjectGraphRecord;
  reloadAnnotations(projectId: string):
    AsyncAction<AnnotationRecord[], string>;
}

interface State {
  player?: Player;
  position: number;
  duration: number;
  playing: boolean;
  fullscreen: boolean;
  showControls: boolean;
  showHints: boolean;
  visibleAnnotations: Set<AnnotationRecord>;
}

const mapStateToProps = (state: AppState) => ({
  user: state.user,
  annotations: state.project.video.annotations
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  reloadAnnotations: (projectId: string) =>
    listAnnotationsThunk(projectId)(dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(
  class extends React.Component<Props, State> {
    fadeoutTimer = -1;
    refreshTimer = -1;
    state = {
      playing: false,
      position: 0,
      duration: 0,
      fullscreen: false,
      showControls: true,
      showHints: false,
      visibleAnnotations: new Set(),
      annotating: false
    } as State;

    componentDidMount() {
      this.resetFadeOutTimer();
      this.props.reloadAnnotations(this.props.project.id);
    }

    componentWillUnmount() {
      clearInterval(this.refreshTimer);
      clearInterval(this.fadeoutTimer);
    }

    refreshPlayer() {
      const { player } = this.state;
      if (player) {
        const annotations = this.props.annotations;
        const position = player.getCurrentTime();
        const visibleAnnotations = Array.from(annotations)
          .filter(annotation =>
            AnnotationUtils.visible(annotation, position)
          );
        visibleAnnotations.forEach(annotation => {
          if (annotation.pause
            && annotation.startTime >= position - 0.10
            && annotation.startTime < position + 0.10) {
            player.pauseVideo();
            player.seekTo(position + 0.10);
          }
        });

        this.setState({
          visibleAnnotations: new Set(visibleAnnotations),
          position: position,
        });
      }
    }

    resetFadeOutTimer() {
      this.setState({ showControls: true });
      clearInterval(this.fadeoutTimer);
      this.fadeoutTimer = window.setInterval(
        this.fadeOutControls.bind(this), FADE_TIMEOUT
      );
    }

    fadeOutControls() {
      this.setState({ showControls: false });
    }

    seek(value: number, pause: boolean) {
      const player = this.state.player;
      if (player) {
        if (pause) {
          player.pauseVideo();
        }
        player.seekTo(value);
      }
    }

    render() {
      const {
        user,
        project,
        annotations
      } = this.props;

      const {
        player,
        playing,
        position,
        duration,
        showControls,
        showHints,
        fullscreen,
        visibleAnnotations,
      } = this.state;

      const onUserAction = this.resetFadeOutTimer.bind(this);

      const onPlayerReady = (event: { target: Player }) => {
        this.refreshTimer = window.setInterval(
          this.refreshPlayer.bind(this), 200);
        this.setState({
          player: event.target,
          duration: event.target.getDuration()
        });
      };

      const onPlayerStateChange = (event: { target: Player, data: number }) => {
        const state = event.data as PlayerState;
        switch (state) {
          case PlayerState.PLAYING:
            this.setState({ playing: true });
            break;
          default:
            this.setState({ playing: false });
        }
      };

      const onFullscreenChange = (newFullscreen: boolean) =>
        this.setState({ fullscreen: newFullscreen });

      const onTogglePlayPause = () => {
        onUserAction();
        if (player) {
          if (playing) {
            player.pauseVideo();
          } else {
            player.playVideo();
          }
        }
      };

      const onToggleFullscreen = () =>
        this.setState(prevState => ({
          ...prevState,
          fullscreen: !prevState.fullscreen
        }));

      const onToggleHints = () => {
        this.setState(prevState => ({
          ...prevState,
          showHints: !prevState.showHints
        }));
      };

      const onClickHint = (annotation: AnnotationRecord) => {
        this.setState({
          showHints: false
        });
        this.seek(annotation.startTime, false);
      };

      const onSeek = this.seek.bind(this);

      return (
          <VideoComponent
            user={user}
            project={project}
            annotations={annotations}
            visibleAnnotations={visibleAnnotations}
            position={position}
            duration={duration}
            playing={playing}
            fullscreen={fullscreen}
            showControls={showControls}
            showHints={showHints}
            onUserAction={onUserAction}
            onPlayerReady={onPlayerReady}
            onPlayerStateChange={onPlayerStateChange}
            onFullscreenChange={onFullscreenChange}
            onTogglePlayPause={onTogglePlayPause}
            onToggleFullscreen={onToggleFullscreen}
            onToggleHints={onToggleHints}
            onClickHint={onClickHint}
            onSeek={onSeek}
          />
      );
    }
  });
