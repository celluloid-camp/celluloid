import "rc-slider/assets/index.css";

import ReactPlayer, { ReactPlayerProps } from "@celluloid/react-player";
import {
  AnnotationRecord,
  ProjectGraphRecord,
  UserRecord,
} from "@celluloid/types";
import AnnotationIcon from "@mui/icons-material/Comment";
import EditIcon from "@mui/icons-material/Edit";
import { Badge, Box, Fab, Grow, useTheme, Zoom } from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { TransitionGroup } from "react-transition-group";
import { Dispatch } from "redux";

// import { useQuery } from "@tanstack/react-query";
import { triggerAddAnnotation } from "~actions/AnnotationsActions";
import { EmptyAction } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";
import { canAnnotate } from "~utils/ProjectUtils";

import { AnnotationContent } from "./components/AnnotationContent/AnnotationContentContainer";
import AnnotationEditor from "./components/AnnotationEditor";
import AnnotationHints from "./components/AnnotationHints";

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
          autoplay: 0,
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
interface Props {
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

const VideoComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(
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
  }: Props) => {
    const [isReady, setIsReady] = useState(false);

    const theme = useTheme();
    const [url, setUrl] = useState<string>("");

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
      <Box
        onMouseMove={onUserAction}
        sx={{
          position: "relative",
          width: "100%",
          paddingBottom: "56.25%",
          backgroundColor: "black",
        }}
      >
        <div onMouseMove={onUserAction}>
          <Player
            url={url}
            onReady={handleVideoReady}
            onDuration={onDuration}
            onProgress={onPlayerProgress}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
            width="100%"
            height="100%"
            playing={playing}
            muted={muted}
          />

          <div
            style={{
              position: "absolute",
              top: 350,
              left: 0,
              right: 0,
              bottom: 0,
              padding: 0,
              margin: 0,
              marginBottom: 50,
            }}
            onMouseMove={onUserAction}
            // onClick={onTogglePlayPause}
          />

          {!showHints && (
            <Box
              sx={{
                overflowY: "auto",
                overflowX: "hidden",
                maxHeight: `100%`,
                verticalAlign: "middle",
                textAlign: "left",
                color: "white",
                transition: "all 0.5s ease",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 2,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              }}
            >
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
                  Array.from(visibleAnnotations.values()).map((annotation) => (
                    <Grow appear={true} in={!editing} key={annotation.id}>
                      <div>
                        <AnnotationContent
                          user={user}
                          project={project}
                          focused={annotation.id === focusedAnnotationId}
                          annotation={annotation}
                        />
                      </div>
                    </Grow>
                  ))}
              </TransitionGroup>
            </Box>
          )}
          {isReady && user && canAnnotate(project, user) && (
            <Zoom
              appear={true}
              exit={true}
              in={!editing && !showHints && showControls}
            >
              <Fab
                color="secondary"
                sx={{
                  right: theme.spacing(2),
                  bottom: theme.spacing(9),
                  position: "absolute" as const,
                  zIndex: 2,
                }}
                onClick={() => onClickAnnotate()}
              >
                <EditIcon />
              </Fab>
            </Zoom>
          )}
          <Box
            onMouseMove={onUserAction}
            sx={{
              overflow: "hidden",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              position: "absolute",
              bottom: 5,
              width: "100%",
              opacity: showControls || showHints ? 1 : 0,
              height: showHints ? `100%` : 0,
            }}
          >
            <AnnotationHints
              duration={duration}
              position={position}
              annotations={annotations}
              visible={showHints}
              onClick={onClickHint}
              onClose={handleToggleHints}
            />
          </Box>

          <Zoom
            appear={true}
            exit={true}
            in={!editing && !showHints && showControls && isReady}
          >
            <Fab
              color="secondary"
              sx={{
                right: theme.spacing(2),
                bottom: theme.spacing(18),
                position: "absolute" as const,
                zIndex: 2,
              }}
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
      </Box>
    );
  }
);

export default VideoComponent;
