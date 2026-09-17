import { Backdrop, CircularProgress } from "@mui/material";
import { useMediaSelector } from "media-chrome/react/media-store";
import { useEffect, useState } from "react";

const LOADING_DELAY = 500;

export const LoadingBackdrop = ({ loadingDelay = LOADING_DELAY }) => {
  const mediaLoading = useMediaSelector(
    (state) => state?.mediaLoading && !state?.mediaPaused,
  );

  return (
    <Backdrop
      sx={{
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={mediaLoading ?? false}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};
