"use client";

import { Box, ThemeProvider } from "@mui/material";
import { useMediaRef } from "media-chrome/react/media-store";
import ReactPlayer from "react-player";
import type { PlayerEntry } from "react-player/players";
import { ControlsContainer } from "./controls/controls-container";
import { LoadingBackdrop } from "./controls/loading-backdrop";
import { canPlay } from "./peertube-video-element";
import PeerTubeVideo from "./peertube-video-element-react";
import theme from "./theme";

// Create a PlayerEntry for the PeerTube player
const peertubePlayerEntry: PlayerEntry = {
  key: "peertube",
  name: "PeerTube",
  canPlay: canPlay,
  player: PeerTubeVideo as any,
};

// Register the custom PeerTube player
ReactPlayer.addCustomPlayer?.(peertubePlayerEntry);

const VideoPlayer = ({ url }: { url: string }) => {
  const mediaRefCallback = useMediaRef();

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
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
        <LoadingBackdrop />
        <ControlsContainer />
      </Box>
    </ThemeProvider>
  );
};

export default VideoPlayer;
