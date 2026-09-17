"use client";

import { Box, ThemeProvider } from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useMediaRef } from "media-chrome/react/media-store";
import ReactPlayer from "react-player";
import { ProjectById } from "@/lib/trpc/types";
import { peerTubeWatchUrl } from "@/utils/peertube-url";
import { AnnotationOverlayHints } from "../project/video/annotation/overlay-hints";
import { ControlsContainer } from "./controls/controls-container";
import { LoadingBackdrop } from "./controls/loading-backdrop";
import "./peertube-setup";
import theme from "./theme";
import { useMediaKeyboardShortcuts } from "./use-media-keyboard-shortcuts";

export default function VideoPlayer({ project }: { project: ProjectById }) {
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
