import { Typography } from "@mui/material";
import { timeUtils, useMediaSelector } from "media-chrome/react/media-store";

const { formatTime } = timeUtils;

export const DurationDisplay = ({
  remaining = true,
}: {
  remaining?: boolean;
}) => {
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);
  const [, seekableEnd = 0] =
    useMediaSelector((state) => state.mediaSeekable) ?? [];
  return (
    <Typography component="span" variant="body2" color="primary">
      {remaining
        ? formatTime(-(seekableEnd - (mediaCurrentTime ?? 0)), seekableEnd)
        : formatTime(seekableEnd, seekableEnd)}
    </Typography>
  );
};
