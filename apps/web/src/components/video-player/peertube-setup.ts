import ReactPlayer from "react-player";
import type { PlayerEntry } from "react-player/players";
import { canPlay } from "./peertube-video-element";
import PeerTubeVideo from "./peertube-video-element-react";

const peertubePlayerEntry: PlayerEntry = {
  key: "peertube",
  name: "PeerTube",
  canPlay: canPlay,
  player: PeerTubeVideo as any,
};

ReactPlayer.addCustomPlayer?.(peertubePlayerEntry);
