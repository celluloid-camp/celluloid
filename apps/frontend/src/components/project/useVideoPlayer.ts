import { atom, selector, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

type VideoPlayerSate = {
  state:
  | "READY"
  | "START"
  | "PLAYING"
  | "PROGRESS"
  | "BUFFERING"
  | "SEEK"
  | "ENDED"
  | "ERROR"
  | "PAUSED" | undefined;
  progress: number;
  error?: Error;

}
const videoPlayerState = atom<VideoPlayerSate>({
  key: 'videoPlayerState', // unique ID (with respect to other atoms/selectors)
  default: {
    state: undefined,
    progress: 0
  }, // default value (aka initial value)
});


const videoPlayerProgress = selector({
  key: 'videoPlayerStateProgress', // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const state = get(videoPlayerState);
    return state.progress;
  },

  set: ({ set }, newValue) => set(videoPlayerState, (previousState) => {
    return { ...previousState, progress: newValue as number }
  }),
  cachePolicy_UNSTABLE: {
    eviction: 'most-recent',
  },
});

export const useSetVideoPlayerProgress = () => useSetRecoilState(videoPlayerProgress);

export const useVideoPlayerProgressValue = () => useRecoilValue(videoPlayerProgress);


export const useVideoPlayerState = () => useRecoilState(videoPlayerState);
