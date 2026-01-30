import type { BoxProps } from "@mui/material";
import { Box } from "@mui/material";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";

export const SeekBackwardGestureRegion = ({ sx }: Pick<BoxProps, "sx">) => {
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );
  return (
    <Box
      component="div"
      sx={{ flex: 1, minWidth: 0, ...sx }}
      onClick={() => {
        const type = MediaActionTypes.MEDIA_SEEK_REQUEST;
        const detail = mediaCurrentTime - 30;
        dispatch({ type, detail });
      }}
    />
  );
};
