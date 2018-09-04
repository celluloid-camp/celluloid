export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
}

export interface Player {
  getCurrentTime(): number;
  getDuration(): number;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(position: number, allowSeekAhead: boolean): void;
}

export interface PlayerReadyEvent {
  target: Player;
}

export interface PlayerChangeEvent {
  target: Player;
  data: number;
}

export enum PlayerEventData {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5
}