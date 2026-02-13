import { Slider } from "@mui/material";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";

export const Seekbar = () => {
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);
  const [min = 0, max = 0] =
    useMediaSelector((state) => state.mediaSeekable) ?? [];
  return (
    <Slider
      aria-label="Seek"
      min={min}
      max={max}
      value={mediaCurrentTime ?? 0}
      onChange={(_event, value) => {
        const type = MediaActionTypes.MEDIA_SEEK_REQUEST;
        const detail = value as number;
        dispatch({ type, detail });
      }}
      size="small"
      sx={{
        mx: 2,
        "& .MuiSlider-thumb": {
          opacity: 0,
          transition: "opacity 0.2s ease",
        },
        "&:hover .MuiSlider-thumb": {
          opacity: 1,
        },
      }}
    />
  );
};
