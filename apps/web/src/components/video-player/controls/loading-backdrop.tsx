"use client";

import { Backdrop, CircularProgress } from "@mui/material";
import { useMediaSelector } from "media-chrome/react/media-store";
import { useEffect, useState } from "react";

const LOADING_DELAY = 500;

export const LoadingBackdrop = ({
  loadingDelay = LOADING_DELAY,
}: {
  loadingDelay?: number;
}) => {
  const mediaLoading = useMediaSelector(
    (state) => state?.mediaLoading && !state?.mediaPaused,
  );

  const [mediaLoadingWithDelay, setMediaLoadingWithDelay] = useState(false);
  const [loadingDelayTimeoutId, setLoadingDelayTimeoutId] = useState<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  useEffect(() => {
    if (loadingDelayTimeoutId) {
      clearTimeout(loadingDelayTimeoutId);
      setLoadingDelayTimeoutId(undefined);
    }
    if (!mediaLoading) {
      setMediaLoadingWithDelay(false);
      return;
    }
    const timeoutId = setTimeout(
      () => setMediaLoadingWithDelay(true),
      loadingDelay,
    );
    setLoadingDelayTimeoutId(timeoutId);
    return () => {
      clearTimeout(timeoutId);
      setLoadingDelayTimeoutId(undefined);
    };
  }, [mediaLoading, loadingDelay]);

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={!!mediaLoadingWithDelay}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};
