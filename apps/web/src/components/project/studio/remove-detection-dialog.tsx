"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { ImageSprite } from "@/components/common/image-sprite";
import { getSpriteThumbnail } from "@/lib/sprite";
import type { DetectionSegment } from "./segments";
import { trackColor } from "./track-color";

const STUDIO_BG = "#191b1d";
const BORDER = "1px solid rgba(255,255,255,0.08)";
const THUMB_WIDTH = 160;
const THUMB_HEIGHT = 90;

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

interface RemoveDetectionDialogProps {
  open: boolean;
  segment: DetectionSegment | null;
  sprite: string | undefined;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemoveDetectionDialog({
  open,
  segment,
  sprite,
  onClose,
  onConfirm,
}: RemoveDetectionDialogProps) {
  const t = useTranslations();

  if (!segment) return null;

  const color = trackColor(segment.objectId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: STUDIO_BG,
            color: "#fff",
            backgroundImage: "none",
            border: BORDER,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: 14,
          fontWeight: 600,
          borderBottom: BORDER,
          pb: 1.5,
        }}
      >
        {t("project.studio.removeSegment.title")}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography
          sx={{ color: "rgba(255,255,255,0.6)", fontSize: 13, mb: 2 }}
        >
          {t("project.studio.removeSegment.description", {
            id: segment.objectId,
            start: formatTime(segment.start),
            end: formatTime(segment.end),
          })}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1,
            borderRadius: 1,
            border: `1px solid ${color}`,
            bgcolor: `${color}22`,
          }}
        >
          <ImageSprite
            src={getSpriteThumbnail(sprite ?? "", segment.thumbnail)}
            width={THUMB_WIDTH}
            height={THUMB_HEIGHT}
            className="rounded-sm shrink-0"
          />
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
            {segment.objectId}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ borderTop: BORDER, px: 2, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "rgba(255,255,255,0.7)" }}>
          {t("project.studio.cancel")}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {t("project.studio.remove")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
