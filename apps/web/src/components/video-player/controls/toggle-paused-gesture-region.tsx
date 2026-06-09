import type { BoxProps } from "@mui/material";
import { Box } from "@mui/material";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";

export const TogglePausedGestureRegion = ({ sx }: Pick<BoxProps, "sx">) => {
  const dispatch = useMediaDispatch();
  const mediaPaused = useMediaSelector(
    (state) => typeof state.mediaPaused !== "boolean" || state.mediaPaused,
  );
  return (
    <Box
      component="div"
      sx={{ flex: 1, minWidth: 0, ...sx }}
      onClick={() => {
        const type = mediaPaused
          ? MediaActionTypes.MEDIA_PLAY_REQUEST
          : MediaActionTypes.MEDIA_PAUSE_REQUEST;
        dispatch({ type });
      }}
    />
  );
};
