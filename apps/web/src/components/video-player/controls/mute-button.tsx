import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { IconButton, Tooltip } from "@mui/material";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";

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
  const dispatch = useMediaDispatch();
  const mediaVolumeLevel = useMediaSelector((state) => state.mediaVolumeLevel);
  const mediaPseudoMuted = mediaVolumeLevel === VolumeLevel.OFF;
  const label = mediaPseudoMuted ? "Unmute" : "Mute";
  const IconComponent =
    VolumeIconComponentMap[mediaVolumeLevel ?? "DEFAULT"] ??
    VolumeIconComponentMap.DEFAULT;
  return (
    <Tooltip title={label} placement="top">
      <IconButton
        aria-label={label}
        color="primary"
        onClick={() => {
          const type = mediaPseudoMuted
            ? MediaActionTypes.MEDIA_UNMUTE_REQUEST
            : MediaActionTypes.MEDIA_MUTE_REQUEST;
          dispatch({ type });
        }}
      >
        <IconComponent />
      </IconButton>
    </Tooltip>
  );
};
