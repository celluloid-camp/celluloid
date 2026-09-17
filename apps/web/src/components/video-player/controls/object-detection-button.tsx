import DeselectIcon from "@mui/icons-material/Deselect";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import { IconButton, Tooltip } from "@mui/material";
import { useTranslations } from "next-intl";
import { useShownDetectionOverlayState } from "@/components/project/video/annotation/useAnnotationEditor";

export const ObjectDetectionButton = () => {
  const t = useTranslations("project.video.controls");
  const [shownDetectionOverlay, setShownDetectionOverlay] =
    useShownDetectionOverlayState();
  const label = shownDetectionOverlay
    ? t("detectionOverlay.hide")
    : t("detectionOverlay.show");
  return (
    <Tooltip title={label} placement="top">
      <IconButton
        aria-label={label}
        color="primary"
        onClick={() => {
          setShownDetectionOverlay(!shownDetectionOverlay);
        }}
      >
        {shownDetectionOverlay ? <DeselectIcon /> : <SelectAllIcon />}
      </IconButton>
    </Tooltip>
  );
};
