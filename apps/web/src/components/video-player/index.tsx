"use client";

import ReactPlayer from "@celluloid/react-player";
import type { OnProgressProps } from "@celluloid/react-player/base";
import * as React from "react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useSetVideoPlayerProgress, useSetVideoPlayerState } from "./store";
import {
  useVideoPlayerEvent,
  useVideoPlayerSeekEvent,
} from "./user-video-player-events";

interface VideoPlayerProps {
  url: string;
  height?: number | string;
}

const VideoPlayer = forwardRef(({ url, height }: VideoPlayerProps, ref) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [isReady, setIsReady] = useState(false);

  const setVideoPlayerProgress = useSetVideoPlayerProgress();

  const setVideoPlayerState = useSetVideoPlayerState();
  useImperativeHandle(ref, () => playerRef.current);

  const dispatcher = useVideoPlayerEvent();

  useVideoPlayerSeekEvent((event) => {
    if (playerRef.current && event.time && isReady) {
      playerRef.current?.seekTo(event.time);
    }
  });

  const handleReady = () => {
    // dispatcher({
    //   state: "READY",
    //   progress: 0,
    // });
  };

  const handlePlay = () => {
    if (!isReady) {
      setIsReady(true);
      setVideoPlayerState("READY");
      dispatcher({
        state: "READY",
        progress: playerRef.current?.getCurrentTime() || 0,
      });
    }
    setVideoPlayerState("PLAYING");
    dispatcher({
      state: "PLAYING",
      progress: playerRef.current?.getCurrentTime() || 0,
    });
  };

  const handleProgress = ({ playedSeconds }: OnProgressProps) => {
    setVideoPlayerProgress(playedSeconds);
  };

  const handlePause = () => {
    setVideoPlayerState("PAUSED");
    dispatcher({
      state: "PAUSED",
      progress: playerRef.current?.getCurrentTime() || 0,
    });
  };

  const handleBuffer = () => {
    setVideoPlayerState("BUFFERING");
    dispatcher({
      state: "BUFFERING",
      progress: playerRef.current?.getCurrentTime() || 0,
    });
  };

  const handleSeek = (seconds: number) => {
    setVideoPlayerState("SEEK");
    dispatcher({
      state: "SEEK",
      progress: seconds,
    });
    setVideoPlayerProgress(seconds);
  };

  const handleError = (error: Error) => {
    setVideoPlayerState("ERROR");
    dispatcher({
      state: "ERROR",
      progress: 0,
      error,
    });
  };

  return (
    <ReactPlayer
      ref={playerRef}
      url={url}
      height={height}
      width={"100%"}
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
      onReady={handleReady}
      onProgress={handleProgress}
      onPause={handlePause}
      onBuffer={handleBuffer}
      onError={handleError}
      onSeek={handleSeek}
      onPlay={handlePlay}
    />
  );
});
export default VideoPlayer;
