import Replay30Icon from "@mui/icons-material/Replay30";
import { IconButton, Tooltip } from "@mui/material";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import { useTranslations } from "next-intl";

export const SeekBackwardButton = () => {
  const t = useTranslations("project.video.controls");
  const label = t("seekBackward");
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );
  return (
    <Tooltip title={label} placement="top">
      <IconButton
        aria-label={label}
        color="primary"
        onClick={() => {
          const type = MediaActionTypes.MEDIA_SEEK_REQUEST;
          const detail = mediaCurrentTime - 30;
          dispatch({ type, detail });
        }}
      >
        <Replay30Icon />
      </IconButton>
    </Tooltip>
  );
};
