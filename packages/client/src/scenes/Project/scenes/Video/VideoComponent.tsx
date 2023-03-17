import "rc-slider/assets/index.css";

import ReactPlayer, { ReactPlayerProps } from "@celluloid/react-player";
import {
  AnnotationRecord,
  ProjectGraphRecord,
  UserRecord,
} from "@celluloid/types";
import {
  Badge,
  Fab,
  Grow as GrowMUI,
  WithStyles,
  withStyles,
  Zoom as ZoomMUI,
} from "@material-ui/core";
import { GrowProps } from "@material-ui/core/Grow";
// import LinearProgress from "@material-ui/core/LinearProgress";
import { ZoomProps } from "@material-ui/core/Zoom";
import AnnotationIcon from "@material-ui/icons/Comment";
import EditIcon from "@material-ui/icons/Edit";
// import { useQuery } from "@tanstack/react-query";
import { triggerAddAnnotation } from "actions/AnnotationsActions";
import classnames from "classnames";
import * as React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { TransitionGroup } from "react-transition-group";
import { Dispatch } from "redux";
import { EmptyAction } from "types/ActionTypes";
import { AppState } from "types/StateTypes";
import { canAnnotate } from "utils/ProjectUtils";

import AnnotationContent from "./components/AnnotationContent";
import AnnotationEditor from "./components/AnnotationEditor";
import AnnotationHints from "./components/AnnotationHints";
import { styles } from "./VideoStyles";

const Zoom: React.FC<React.PropsWithChildren & ZoomProps> = (props) => (
  <ZoomMUI {...props} />
);

const Grow: React.FC<React.PropsWithChildren & GrowProps> = (props) => (
  <GrowMUI {...props} />
);

const Player: React.FC<ReactPlayerProps> = (props) => {
  const playerRef = React.useRef<ReactPlayer>(null);

  // useEffect(() => {
  //   if (playerRef && playerRef.current) {

  //     setInterval(() => {
  //       console.log("getDuration", playerRef.current?.getDuration());
  //       // onPlayerReady(playerRef.current);
  //       // setIsReady(true);
  //     }, 1000);
  //   }
  // }, [playerRef]);

  return (
    <ReactPlayer
      ref={playerRef}
      width="100%"
      height="100%"
      onError={(error, data, hlsInstance) => {
        console.log({ error, data, hlsInstance });
      }}
      config={{
        peertube: {
          controls: 1,
          controlBar: 1,
          peertubeLink: 0,
          title: 0,
          warningTitle: 0,
          p2p: 0,
          autoplay: 1,
        },
      }}
      {...props}
    />
  );
};

export enum PlayerEvent {
  PLAYING,
  BUFFERING,
  ENDED,
  PAUSED,
}

export type PlayerProgressState = {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
};
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
  onPlayerReady(player: ReactPlayer): void;
  onPlayerProgress(state: PlayerProgressState): void;
  onPlayerStateChange(event: PlayerEvent, data: number): void;
  onDuration(duration: number): void;
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
  focusedAnnotation: state.project.video.focusedAnnotation,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClickAnnotate: () => dispatch(triggerAddAnnotation()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withStyles(styles)(
    ({
      user,
      project,
      annotations,
      focusedAnnotation,
      visibleAnnotations,
      position,
      duration,
      playing,
      showControls,
      showHints,
      editing,
      onUserAction,
      onPlayerReady,
      onDuration,
      onPlayerProgress,
      onToggleHints,
      onClickHint,
      onClickAnnotate,
      onSeek,
      classes,
    }: Props) => {
      const [isReady, setIsReady] = useState(false);

      const [url, setUrl] = useState<string>("");

      const controlsOpacity =
        showControls || showHints ? classes.visible : classes.hidden;

      const hintBoxHeight = showHints
        ? classes.hintBoxExpanded
        : classes.hintBoxCollapsed;

      const focusedAnnotationId = focusedAnnotation
        ? focusedAnnotation.id
        : undefined;

      const [muted] = useState(false);

      const handleVideoReady = (player: ReactPlayer) => {
        onPlayerReady(player);
        setIsReady(true);
      };

      useEffect(() => {
        if (project) {
          setUrl(`https://${project.host}/w/${project.videoId}`);
        }

        return () => {
          setUrl("");
        };
      }, [project]);

      // if (isLoading) {
      //   return (
      //     <Grid
      //       container
      //       direction="column"
      //       justify="center"
      //       alignItems="center"
      //       className={classnames(classes.progressWrapper)}
      //     >
      //       <Grid item>
      //         <CircularProgress
      //           className={classes.progress}
      //           size={30}
      //           thickness={5}
      //         />
      //       </Grid>
      //     </Grid>
      //   );
      // }

      const handleToggleHints = (event: any) => {
        if (event) {
          event.stopPropagation();
        }

        onToggleHints();
      };

      return (
        <div
          onMouseMove={onUserAction}
          className={classnames("full-screenable-node", classes.videoWrapper)}
        >
          <div onMouseMove={onUserAction}>
            <Player
              url={url}
              onReady={handleVideoReady}
              onDuration={onDuration}
              onProgress={onPlayerProgress}
              className={classes.videoIframe}
              width="100%"
              height="100%"
              playing={playing}
              muted={muted}
            />

            <div
              className={classes.glassPane}
              onMouseMove={onUserAction}
              // onClick={onTogglePlayPause}
            />

            {!showHints && (
              <div className={classes.annotationFrame}>
                <Grow appear={true} in={editing}>
                  <div>
                    {user && editing && (
                      <AnnotationEditor
                        user={user}
                        projectId={project.id}
                        video={{
                          position: position,
                          duration: duration,
                        }}
                        onSeek={onSeek}
                      />
                    )}
                  </div>
                </Grow>
                <TransitionGroup appear={true}>
                  {!editing &&
                    Array.from(visibleAnnotations.values()).map(
                      (annotation) => (
                        <Grow appear={true} in={!editing} key={annotation.id}>
                          <div>
                            <AnnotationContent
                              project={project}
                              focused={annotation.id === focusedAnnotationId}
                              annotation={annotation}
                            />
                          </div>
                        </Grow>
                      )
                    )}
                </TransitionGroup>
              </div>
            )}
            {isReady && user && canAnnotate(project, user) && (
              <Zoom
                appear={true}
                exit={true}
                in={!editing && !showHints && showControls}
              >
                <Fab
                  color="secondary"
                  className={classes.annotateButton}
                  onClick={() => onClickAnnotate()}
                >
                  <EditIcon />
                </Fab>
              </Zoom>
            )}
            <div
              onMouseMove={onUserAction}
              className={classnames(
                classes.hintBox,
                controlsOpacity,
                hintBoxHeight
              )}
            >
              <AnnotationHints
                duration={duration}
                position={position}
                annotations={annotations}
                visible={showHints}
                onClick={onClickHint}
                onClose={handleToggleHints}
              />
            </div>

            <Zoom
              appear={true}
              exit={true}
              in={!editing && !showHints && showControls && isReady}
            >
              <Fab
                color="secondary"
                className={classes.annotationsButton}
                onClick={handleToggleHints}
              >
                <Badge badgeContent={annotations.length} color="primary">
                  <AnnotationIcon />
                </Badge>
              </Fab>
            </Zoom>

            {/* {isReady ? (
                <div
                  onMouseMove={onUserAction}
                  className={classnames([
                    classes.controlFrame,
                    controlsOpacity,
                  ])}
                >
                  <Controls
                    user={user}
                    annotations={annotations}
                    position={position}
                    duration={duration}
                    fullscreen={fullscreen}
                    muted={muted}
                    playing={playing}
                    onSeek={onSeek}
                    onToggleFullscreen={onToggleFullscreen}
                    onTogglePlayPause={onTogglePlayPause}
                    onToggleHints={onToggleHints}
                    onToggleMuted={handleToggleMute}
                  />
                </div>
              ) : (
                <div className={classnames([classes.linearContainer])}>
                  <LinearProgress
                    classes={{
                      colorPrimary: classes.linearColorPrimary,
                      barColorPrimary: classes.linearBarColorPrimary,
                    }}
                  />
                </div>
              )} */}
          </div>
        </div>
      );
    }
  )
);
