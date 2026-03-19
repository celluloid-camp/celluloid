import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import { IconButton, Tooltip } from "@mui/material";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import { useAnnotationHintsVisible } from "@/components/project/video/annotation/useAnnotationEditor";

export const AnnotationsButton = () => {
  const dispatch = useMediaDispatch();
  const [hintsVisible, setHintsVisible] = useAnnotationHintsVisible();

  const label = hintsVisible ? "Hide annotations" : "Show annotations";
  return (
    <Tooltip title={label} placement="top">
      <IconButton
        aria-label={label}
        color="primary"
        onClick={() => {
          setHintsVisible(!hintsVisible);
        }}
      >
        <ViewTimelineIcon />
      </IconButton>
    </Tooltip>
  );
};
