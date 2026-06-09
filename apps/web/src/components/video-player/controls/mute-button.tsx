import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { IconButton, Tooltip } from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import { useTranslations } from "next-intl";

const VolumeLevel = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  OFF: "off",
} as const;

const VolumeIconComponentMap: Record<
  (typeof VolumeLevel)[keyof typeof VolumeLevel] | "DEFAULT",
  typeof VolumeUpIcon
> = {
  [VolumeLevel.HIGH]: VolumeUpIcon,
  [VolumeLevel.MEDIUM]: VolumeDownIcon,
  [VolumeLevel.LOW]: VolumeDownIcon,
  [VolumeLevel.OFF]: VolumeOffIcon,
  DEFAULT: VolumeOffIcon,
};

export const MuteButton = () => {
  const t = useTranslations("project.video.controls");
  const dispatch = useMediaDispatch();
  const mediaVolumeLevel = useMediaSelector((state) => state.mediaVolumeLevel);
  const mediaPseudoMuted = mediaVolumeLevel === VolumeLevel.OFF;
  const label = mediaPseudoMuted ? t("mute.unmute") : t("mute.mute");
  const IconComponent =
    VolumeIconComponentMap[mediaVolumeLevel ?? "DEFAULT"] ??
    VolumeIconComponentMap.DEFAULT;
  const [, setMuted] = useLocalStorage("muted", false);

  return (
    <Tooltip title={label} placement="top">
      <IconButton
        aria-label={label}
        color="primary"
        onClick={() => {
          const type = mediaPseudoMuted
            ? MediaActionTypes.MEDIA_UNMUTE_REQUEST
            : MediaActionTypes.MEDIA_MUTE_REQUEST;
          setMuted(!mediaPseudoMuted);
          dispatch({ type });
        }}
      >
        <IconComponent />
      </IconButton>
    </Tooltip>
  );
};
