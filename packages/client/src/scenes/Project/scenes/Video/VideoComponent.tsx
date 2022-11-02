import 'rc-slider/assets/index.css';

import {
  AnnotationRecord,
  ProjectGraphRecord,
  UserRecord
} from '@celluloid/types';
import {
  Button,
  Grow as GrowMUI,
  WithStyles,
  withStyles,
  Zoom as ZoomMUI
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { triggerAddAnnotation } from 'actions/AnnotationsActions';
import classnames from 'classnames';
import * as React from 'react';
import Fullscreen from 'react-full-screen';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import YouTube from 'react-youtube';
import { Dispatch } from 'redux';
import { EmptyAction } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';
import { canAnnotate } from 'utils/ProjectUtils';

import AnnotationContent from './components/AnnotationContent';
import AnnotationEditor from './components/AnnotationEditor';
import AnnotationHints from './components/AnnotationHints';
import Controls from './components/Controls';
import { styles } from './VideoStyles';
import { YouTubePlayer } from 'youtube-player/dist/types';
import { ZoomProps } from '@material-ui/core/Zoom';
import { GrowProps } from '@material-ui/core/Grow';

const Zoom:React.FC<React.PropsWithChildren & ZoomProps> = (props) => (
  <ZoomMUI {...props} />
);

const Grow:React.FC<React.PropsWithChildren & GrowProps> = (props) => (
  <GrowMUI {...props} />
);

interface Props extends WithStyles<typeof styles> {
  user?: UserRecord;
  project: ProjectGraphRecord;
  annotations: AnnotationRecord[];
  focusedAnnotation?: AnnotationRecord;
  visibleAnnotations: AnnotationRecord[];
  position: number;
  duration: number;
  playing: boolean;
  editing: boolean;
  fullscreen: boolean;
  showControls: boolean;
  showHints: boolean;
  onUserAction(): void;
  onPlayerReady(event:  { target: YouTubePlayer; }): void;
  onPlayerStateChange(event: { target: YouTubePlayer; data: number; }): void;
  onFullscreenChange(newState: boolean): void;
  onTogglePlayPause(): void;
  onToggleFullscreen(): void;
  onToggleHints(): void;
  onClickHint(annotation: AnnotationRecord): void;
  onClickAnnotate(): EmptyAction;
  onSeek(position: number, pause: boolean, seekAhead: boolean): void;
}

const mapStateToProps = (state: AppState) => ({
  editing: state.project.video.editing,
  focusedAnnotation: state.project.video.focusedAnnotation
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClickAnnotate: () => dispatch(triggerAddAnnotation())
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(({
    user,
    project,
    annotations,
    focusedAnnotation,
    visibleAnnotations,
    position,
    duration,
    playing,
    fullscreen,
    showControls,
    showHints,
    editing,
    onUserAction,
    onPlayerReady,
    onPlayerStateChange,
    onFullscreenChange,
    onTogglePlayPause,
    onToggleFullscreen,
    onToggleHints,
    onClickHint,
    onClickAnnotate,
    onSeek,
    classes
  }: Props) => {
    const controlsOpacity = showControls || showHints ?
      classes.visible : classes.hidden;

    const hintBoxHeight = showHints ?
      classes.hintBoxExpanded : classes.hintBoxCollapsed;

    const focusedAnnotationId = focusedAnnotation
      ? focusedAnnotation.id
      : undefined;

    return (
      <Fullscreen
        enabled={fullscreen}
        onChange={onFullscreenChange}
      >
        <div
          className={classnames(
            'full-screenable-node',
            classes.videoWrapper
          )}
        >
          <div>
            <YouTube
              videoId={project.videoId}
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
              onClick={onTogglePlayPause}
            />
            {!showHints &&
              <div
                className={classes.annotationFrame}
                onMouseMove={onUserAction}
              >
                <Grow
                  appear={true}
                  in={editing}
                >
                  <div>
                    {user && editing &&
                      <AnnotationEditor
                        user={user}
                        projectId={project.id}
                        video={{
                          position: position,
                          duration: duration
                        }}
                        onSeek={onSeek}
                      />
                    }
                  </div>
                </Grow>
                <TransitionGroup appear={true}>
                  {!editing && Array.from(visibleAnnotations.values())
                    .map(annotation =>
                      <Grow
                        appear={true}
                        in={!editing}
                        key={annotation.id}
                      >
                        <div>
                          <AnnotationContent
                            project={project}
                            focused={
                              annotation.id === focusedAnnotationId
                            }
                            annotation={annotation}
                          />
                        </div>
                      </Grow>
                    )
                  }
                </TransitionGroup>
              </div>
            }
            {(user && canAnnotate(project, user)) &&
              <Zoom
                appear={true}
                exit={true}
                in={!editing && !showHints && showControls}
              >
                <Button
                  color="secondary"
                  className={classes.annotateButton}
                  onClick={() => onClickAnnotate()}
                >
                  <EditIcon />
                </Button>
              </Zoom>
            }
            <div
              onMouseMove={onUserAction}
              className={classnames(classes.hintBox, controlsOpacity, hintBoxHeight)}
            >
              <AnnotationHints
                duration={duration}
                position={position}
                annotations={annotations}
                visible={showHints}
                onClick={onClickHint}
              />
            </div>
            <div
              onMouseMove={onUserAction}
              className={classnames([
                classes.controlFrame, controlsOpacity
              ])}
            >
              <Controls
                user={user}
                annotations={annotations}
                position={position}
                duration={duration}
                fullscreen={fullscreen}
                playing={playing}
                onSeek={onSeek}
                onToggleFullscreen={onToggleFullscreen}
                onTogglePlayPause={onTogglePlayPause}
                onToggleHints={onToggleHints}
              />
            </div>
          </div>
        </div>
      </Fullscreen>
    );
  })
);