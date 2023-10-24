import useEvent from "react-use-event";

export const PlayerEventName = "PlayerEvent";

export type VideoPlayerEvent = {
  type: "PlayerEvent",
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
