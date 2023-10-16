import ReactPlayer from "@celluloid/react-player";
import { OnProgressProps } from "@celluloid/react-player/base";
import * as React from "react";
import { forwardRef, useImperativeHandle, useState } from "react";

import { useVideoPlayerEvent } from "~hooks/use-video-player";

interface VideoPlayerProps {
  url: string;
}

export const VideoPlayer = forwardRef(({ url }: VideoPlayerProps, ref) => {
  const playerRef = React.useRef<ReactPlayer>(null);
  const [isReady, setIsReady] = useState(false);

  useImperativeHandle(ref, () => playerRef.current);

  const dispatcher = useVideoPlayerEvent();

  const handleReady = (player: ReactPlayer) => {
    // console.log("ready", player);
    // console.log("getCurrentTime", player.getCurrentTime());
    // console.log("getSecondsLoaded", player.getSecondsLoaded());
    // console.log("getDuration", player.getDuration());
    setIsReady(true);
    dispatcher({
      state: "READY",
      progress: 0,
    });
  };

  const handleProgress = ({ playedSeconds }: OnProgressProps) => {
    dispatcher({
      state: "PROGRESS",
      progress: playedSeconds,
    });
  };

  const handlePause = () => {
    dispatcher({
      state: "PAUSED",
      progress: playerRef.current?.getCurrentTime() || 0,
    });
  };

  const handleBuffer = () => {
    dispatcher({
      state: "BUFFERING",
      progress: playerRef.current?.getCurrentTime() || 0,
    });
  };

  const handleSeek = (seconds: number) => {
    dispatcher({
      state: "SEEK",
      progress: seconds,
    });
  };

  const handleError = (error: Error) => {
    dispatcher({
      state: "SEEK",
      progress: 0,
      error,
    });
  };

  return (
    <ReactPlayer
      ref={playerRef}
      url={url}
      width="100%"
      height="100%"
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
      onReady={handleReady}
      onProgress={handleProgress}
      onPause={handlePause}
      onBuffer={handleBuffer}
      onError={handleError}
      onSeek={handleSeek}
      playing={true}
      style={{
        width: "100%",
        height: "100%",
        border: 0,
        padding: 0,
        margin: 0,
      }}
    />
  );
});
