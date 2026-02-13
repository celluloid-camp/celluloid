"use client";

import { Box, Stack } from "@mui/material";
import { useMediaSelector } from "media-chrome/react/media-store";
import { useState } from "react";
import { AudioMenuButton } from "./audio-menu-button";
import { CaptionsMenuButton } from "./captions-menu-button";
import { CurrentTimeDisplay } from "./current-time-display";
import { DurationDisplay } from "./duration-display";
import { FullscreenButton } from "./fullscreen-button";
import { LoadingBackdrop } from "./loading-backdrop";
import { MuteButton } from "./mute-button";
import { PlayButton } from "./play-button";
import { PlaybackRateMenuButton } from "./playback-rate-menu-button";
import { SeekBackwardButton } from "./seek-backward-button";
import { SeekBackwardGestureRegion } from "./seek-backward-gesture-region";
import { SeekForwardButton } from "./seek-forward-button";
import { SeekForwardGestureRegion } from "./seek-forward-gesture-region";
import { Seekbar } from "./seekbar";
import { TogglePausedGestureRegion } from "./toggle-paused-gesture-region";
import { VolumeSlider } from "./volume-slider";

export const ControlsContainer = () => {
  const mediaPaused = useMediaSelector(
    (state) => typeof state.mediaPaused !== "boolean" || state.mediaPaused,
  );
  const [userActive, setUserActive] = useState(false);

  return (
    <Box
      onMouseEnter={() => setUserActive(true)}
      onMouseLeave={() => setUserActive(false)}
      sx={{
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        background: "linear-gradient(to top, rgb(0, 0, 0, 1), transparent)",
        opacity: mediaPaused || userActive ? 1 : 0,
        "&:hover": {
          opacity: 1,
        },
        "&:focus-within": {
          opacity: 1,
        },
      }}
    >
      <Stack direction="column" height="100%" justifyContent="flex-end">
        <Stack
          direction="row"
          sx={{ flex: 1, minHeight: 0 }}
          alignItems="stretch"
        >
          <SeekBackwardGestureRegion />
          <TogglePausedGestureRegion />
          <SeekForwardGestureRegion />
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0}
          sx={{ px: 1, pb: 0.5 }}
        >
          <PlayButton />
          <SeekBackwardButton />
          <SeekForwardButton />
          <MuteButton />
          <VolumeSlider />
          <CurrentTimeDisplay />
          <Seekbar />
          <DurationDisplay />
          <PlaybackRateMenuButton />
          <CaptionsMenuButton />
          <FullscreenButton />
        </Stack>
      </Stack>
    </Box>
  );
};
