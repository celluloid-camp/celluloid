import { Typography } from "@mui/material";
import { timeUtils, useMediaSelector } from "media-chrome/react/media-store";

const { formatTime } = timeUtils;

export const CurrentTimeDisplay = () => {
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);
  const [, seekableEnd] =
    useMediaSelector((state) => state.mediaSeekable) ?? [];
  return (
    <Typography component="span" variant="body2" color="primary">
      {formatTime(mediaCurrentTime ?? 0, seekableEnd)}
    </Typography>
  );
};
