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
import { ProjectById, UserMe } from "~utils/trpc";

import { AnnotationContent } from "./components/AnnotationContent/AnnotationContentContainer";
import AnnotationEditor from "./components/AnnotationEditor";
import AnnotationHints from "./components/AnnotationHints";

const PlayerWithRef: React.FC<ReactPlayerProps> = (props) => {
  const playerRef = React.useRef<ReactPlayer>(null);
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

interface VideoPlayerProps {
  user?: UserMe;
  project: ProjectById;
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

export const VideoPlayer = ({
  user,
  project,
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
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);

  const [muted] = useState(false);

  const handleVideoReady = (player: ReactPlayer) => {
    onPlayerReady(player);
    setIsReady(true);
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
        <PlayerWithRef
          url={`https://${project.host}/w/${project.videoId}`}
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
      </div>
    </Box>
  );
};
