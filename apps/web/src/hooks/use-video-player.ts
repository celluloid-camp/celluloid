import useEvent from "react-use-event";

export const PlayerEventName = "VideoPlayerEvent";

export type VideoPlayerEvent = {
  type: "VideoPlayerEvent",
  state:
  | "READY"
  | "START"
  | "PLAYING"
  | "PROGRESS"
  | "BUFFERING"
  | "SEEK"
  | "ENDED"
  | "ERROR"
  | "PAUSED";
  progress: number;
  error?: Error;
};

export const useVideoPlayerEvent = (onEvent?: (event: VideoPlayerEvent) => void) =>
  useEvent<VideoPlayerEvent>(PlayerEventName, onEvent);


export const PlayerSeekEventName = "VideoPlayerSeekEvent";

export type VideoPlayerSeekEvent = {
  type: "VideoPlayerSeekEvent",
  time: number;
};

export const useVideoPlayerSeekEvent = (onEvent?: (event: VideoPlayerSeekEvent) => void) =>
  useEvent<VideoPlayerSeekEvent>(PlayerSeekEventName, onEvent);

