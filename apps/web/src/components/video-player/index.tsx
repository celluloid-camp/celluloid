"use client";

import { ThemeProvider } from "@mui/material";
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaMuteButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import { useMediaRef } from "media-chrome/react/media-store";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ReactPlayer from "react-player";
import type { PlayerEntry } from "react-player/players";
import { VideoElementProps } from "react-player/types";
import { ControlsContainer } from "./controls/controls-container";
import { canPlay } from "./peertube-video-element";
import PeerTubeVideo from "./peertube-video-element-react";
import { useSetVideoPlayerProgress, useSetVideoPlayerState } from "./store";
import theme from "./theme";
import {
  useVideoPlayerEvent,
  useVideoPlayerSeekEvent,
} from "./user-video-player-events";

// Create a PlayerEntry for the PeerTube player
const peertubePlayerEntry: PlayerEntry = {
  key: "peertube",
  name: "PeerTube",
  canPlay: canPlay,
  player: PeerTubeVideo as any,
};

// Register the custom PeerTube player
ReactPlayer.addCustomPlayer?.(peertubePlayerEntry);

interface OnProgressProps {
  playedSeconds: number;
  loadedSeconds: number;
}

interface VideoPlayerProps {
  url: string;
  height?: number | string;
}

export interface VideoPlayerHandle {
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  play: () => void;
  pause: () => void;
}

const VideoPlayer = ({ url, height }: VideoPlayerProps) => {
  const mediaRefCallback = useMediaRef();

  return (
    <ThemeProvider theme={theme}>
      <ReactPlayer
        ref={mediaRefCallback}
        slot="media"
        src={url}
        height="100%"
        width="100%"
        controls={false}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      <ControlsContainer />
    </ThemeProvider>
  );
};

export default VideoPlayer;
