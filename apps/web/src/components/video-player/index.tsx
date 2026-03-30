"use client";

import { Box, Button, ThemeProvider } from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaRef,
  useMediaSelector,
} from "media-chrome/react/media-store";
import ReactPlayer from "react-player";
import type { PlayerEntry } from "react-player/players";
import { ProjectById } from "@/lib/trpc/types";
import { peerTubeWatchUrl } from "@/utils/peertube-url";
import { AnnotationOverlayHints } from "../project/video/annotation/overlay-hints";
import { useShownDetectionOverlayState } from "../project/video/annotation/useAnnotationEditor";
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

export default function VideoPlayer({ project }: { project: ProjectById }) {
  const mediaRefCallback = useMediaRef();
  const dispatch = useMediaDispatch();
  const mediaPaused = useMediaSelector(
    (state) => typeof state.mediaPaused !== "boolean" || state.mediaPaused,
  );
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );
  const [muted] = useLocalStorage("muted", false);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === " " || event.code === "Space") {
      event.preventDefault();
      dispatch({
        type: mediaPaused
          ? MediaActionTypes.MEDIA_PLAY_REQUEST
          : MediaActionTypes.MEDIA_PAUSE_REQUEST,
      });
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      dispatch({
        type: MediaActionTypes.MEDIA_SEEK_REQUEST,
        detail: mediaCurrentTime - 30,
      });
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      dispatch({
        type: MediaActionTypes.MEDIA_SEEK_REQUEST,
        detail: mediaCurrentTime + 30,
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          outline: "none",
          "&:focus, &:focus-visible": {
            outline: "none",
          },
        }}
        tabIndex={0}
        onKeyDown={handleKeyPress}
      >
        <ReactPlayer
          ref={mediaRefCallback}
          slot="media"
          src={peerTubeWatchUrl(project.host, project.videoId)}
          height="100%"
          width="100%"
          muted={muted}
          autoPlay={false}
          controls={false}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
        <LoadingBackdrop />
        <AnnotationOverlayHints project={project} />
        <ControlsContainer />
      </Box>
    </ThemeProvider>
  );
}
