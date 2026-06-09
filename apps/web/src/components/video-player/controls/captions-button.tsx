import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import ClosedCaptionDisabledIcon from "@mui/icons-material/ClosedCaptionDisabled";
import { IconButton, Tooltip } from "@mui/material";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import { useTranslations } from "next-intl";

export const CaptionsButton = () => {
  const t = useTranslations("project.video.controls");
  const dispatch = useMediaDispatch();
  const showingSubtitles = useMediaSelector(
    (state) => !!state.mediaSubtitlesShowing?.length,
  );

  const label = t("captionsButton.label");
  const IconComponent = showingSubtitles
    ? ClosedCaptionIcon
    : ClosedCaptionDisabledIcon;
  return (
    <Tooltip title={label} placement="top">
      <IconButton
        aria-label={label}
        color="primary"
        onClick={() => {
          const type = MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST;
          dispatch({ type });
        }}
      >
        <IconComponent />
      </IconButton>
    </Tooltip>
  );
};
