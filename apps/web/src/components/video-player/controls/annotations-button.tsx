import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import { IconButton, Tooltip } from "@mui/material";
import { useTranslations } from "next-intl";
import { useAnnotationHintsVisible } from "@/components/project/video/annotation/useAnnotationEditor";

export const AnnotationsButton = () => {
  const t = useTranslations("project.video.controls");
  const [hintsVisible, setHintsVisible] = useAnnotationHintsVisible();

  const label = hintsVisible
    ? t("annotationHints.hide")
    : t("annotationHints.show");
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
