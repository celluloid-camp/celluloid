"use client";

import { Box, ThemeProvider } from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useMediaRef } from "media-chrome/react/media-store";
import ReactPlayer from "react-player";
import { LoadingBackdrop } from "@/components/video-player/controls/loading-backdrop";
import { StudioControlsContainer } from "@/components/video-player/controls/studio-controls-container";
import "@/components/video-player/peertube-setup";
import theme from "@/components/video-player/theme";
import { useMediaKeyboardShortcuts } from "@/components/video-player/use-media-keyboard-shortcuts";

type StudioVideoPlayerProps = {
  src: string;
};

export function StudioVideoPlayer({ src }: StudioVideoPlayerProps) {
  const mediaRefCallback = useMediaRef();
  const [muted] = useLocalStorage("muted", false);

  useMediaKeyboardShortcuts();

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
      >
        <ReactPlayer
          ref={mediaRefCallback}
          slot="media"
          src={src}
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
        <StudioControlsContainer />
      </Box>
    </ThemeProvider>
  );
}
