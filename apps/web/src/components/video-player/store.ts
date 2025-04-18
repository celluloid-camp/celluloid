import { create } from "zustand";

type VideoPlayerState = {
  state:
    | "READY"
    | "START"
    | "PLAYING"
    | "PROGRESS"
    | "BUFFERING"
    | "SEEK"
    | "ENDED"
    | "ERROR"
    | "PAUSED"
    | undefined;
  progress: number;
  error?: Error;
  // Actions
  setProgress: (progress: number) => void;
  setState: (state: VideoPlayerState["state"]) => void;
  setError: (error: Error) => void;
};

const videoPlayerStore = create<VideoPlayerState>((set) => ({
  state: undefined,
  progress: 0,
  setProgress: (progress) => set({ progress }),
  setState: (state) => set({ state }),
  setError: (error) => set({ error }),
}));

// Helper hooks for specific state values
export const useVideoPlayerProgress = () =>
  videoPlayerStore((state) => state.progress);
export const useSetVideoPlayerProgress = () =>
  videoPlayerStore((state) => state.setProgress);

export const useSetVideoPlayerState = () => {
  const state = videoPlayerStore((state) => state.state);
  const setState = videoPlayerStore((state) => state.setState);
  return [state, setState] as const;
};
