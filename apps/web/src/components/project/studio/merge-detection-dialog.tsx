"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Radio,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ImageSprite } from "@/components/common/image-sprite";
import { getSpriteThumbnail } from "@/lib/sprite";
import type { DetectionTrack } from "./segments";

const STUDIO_BG = "#191b1d";
const BORDER = "1px solid rgba(255,255,255,0.08)";
const THUMB_WIDTH = 80;
const THUMB_HEIGHT = 45;

interface MergeDetectionDialogProps {
  open: boolean;
  tracks: DetectionTrack[];
  sprite: string | undefined;
  onClose: () => void;
  onConfirm: (targetId: string) => void;
}

export function MergeDetectionDialog({
  open,
  tracks,
  sprite,
  onClose,
  onConfirm,
}: MergeDetectionDialogProps) {
  const t = useTranslations();
  const [targetId, setTargetId] = useState("");

  useEffect(() => {
    if (open && tracks.length > 0) {
      setTargetId(tracks[0].objectId);
    }
  }, [open, tracks]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (!targetId) return;
    onConfirm(targetId);
    handleClose();
  };

  if (tracks.length === 0) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
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
        {t("project.studio.mergeDialog.title")}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography
          sx={{ color: "rgba(255,255,255,0.6)", fontSize: 13, mb: 2 }}
        >
          {t("project.studio.mergeDialog.description")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {tracks.map((track) => {
            const selected = targetId === track.objectId;
            return (
              <Box
                key={track.objectId}
                onClick={() => setTargetId(track.objectId)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  border: selected ? "1px solid #5297FF" : BORDER,
                  bgcolor: selected ? "rgba(82,151,255,0.15)" : "transparent",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: selected
                      ? "rgba(82,151,255,0.15)"
                      : "rgba(255,255,255,0.04)",
                  },
                }}
              >
                <Radio
                  checked={selected}
                  onChange={() => setTargetId(track.objectId)}
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    "&.Mui-checked": { color: "#5297FF" },
                    p: 0.5,
                  }}
                />
                <Box
                  sx={{
                    flexShrink: 0,
                    borderRadius: 0.5,
                    overflow: "hidden",
                    bgcolor: "black",
                    border: BORDER,
                  }}
                >
                  <ImageSprite
                    src={getSpriteThumbnail(sprite ?? "", track.thumbnail)}
                    width={THUMB_WIDTH}
                    height={THUMB_HEIGHT}
                    alt={track.objectId}
                    bbox={track.bbox ?? null}
                    bboxClassName="!border-white"
                  />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {track.objectId}
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 11,
                      textTransform: "capitalize",
                    }}
                  >
                    {track.className}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: BORDER,
          px: 2,
          py: 1.5,
        }}
      >
        <Button onClick={handleClose} sx={{ color: "rgba(255,255,255,0.8)" }}>
          {t("project.studio.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!targetId}
        >
          {t("project.studio.merge")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
