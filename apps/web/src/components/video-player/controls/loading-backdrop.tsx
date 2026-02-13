import { Backdrop, CircularProgress } from "@mui/material";
import { useMediaSelector } from "media-chrome/react/media-store";
import { useEffect, useState } from "react";

const LOADING_DELAY = 500;

export const LoadingBackdrop = ({ loadingDelay = LOADING_DELAY }) => {
  const mediaLoading = useMediaSelector(
    (state) => state?.mediaLoading && !state?.mediaPaused,
  );

  // Example implementation of a delay in showing loading indicator when loading media starts (but quickly hiding it when it's done)
  const [mediaLoadingWithDelay, setMediaLoadingWithDelay] = useState(false);
  const [loadingDelayTimeoutId, setLoadingDelayTimeoutId] = useState<number>();
  useEffect(() => {
    if (loadingDelayTimeoutId) {
      clearTimeout(loadingDelayTimeoutId);
      setLoadingDelayTimeoutId(undefined);
    }
    if (!mediaLoading) {
      setMediaLoadingWithDelay(false);
      return;
    }
    const timeoutId = setTimeout(setMediaLoadingWithDelay, loadingDelay, true);
    // setTimeout is picking up node.js version of timeout, hence ts-ignore :(
    // @ts-ignore
    setLoadingDelayTimeoutId(timeoutId);
    return () => {
      clearTimeout(loadingDelayTimeoutId);
      setLoadingDelayTimeoutId(undefined);
    };
  }, [mediaLoading, loadingDelay, loadingDelayTimeoutId]);

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
      open={!!mediaLoadingWithDelay}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};
