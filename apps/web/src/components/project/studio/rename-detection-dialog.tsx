"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ImageSprite } from "@/components/common/image-sprite";
import { getSpriteThumbnail } from "@/lib/sprite";
import type { DetectionTrack } from "./segments";

const STUDIO_BG = "#191b1d";
const BORDER = "1px solid rgba(255,255,255,0.08)";
const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 180;

interface RenameDetectionDialogProps {
  open: boolean;
  track: DetectionTrack | null;
  sprite: string | undefined;
  existingIds: string[];
  onClose: () => void;
  onSave: (newId: string) => void;
}

export function RenameDetectionDialog({
  open,
  track,
  sprite,
  existingIds,
  onClose,
  onSave,
}: RenameDetectionDialogProps) {
  const t = useTranslations();
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (track) {
      setLabel(track.objectId);
      setError(null);
    }
  }, [track]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSave = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      setError(t("project.studio.rename.required"));
      return;
    }
    if (track && trimmed !== track.objectId && existingIds.includes(trimmed)) {
      setError(t("project.studio.rename.duplicate"));
      return;
    }
    onSave(trimmed);
    handleClose();
  };

  if (!track) return null;

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
        {t("project.studio.rename.title")}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Box
            sx={{
              flexShrink: 0,
              borderRadius: 1,
              overflow: "hidden",
              bgcolor: "black",
              border: BORDER,
            }}
          >
            <ImageSprite
              src={getSpriteThumbnail(sprite ?? "", track.thumbnail)}
              width={PREVIEW_WIDTH}
              height={PREVIEW_HEIGHT}
              alt={track.objectId}
              className="rounded-sm"
              bbox={track.bbox ?? null}
              bboxClassName="!border-white"
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                mb: 1.5,
                textTransform: "capitalize",
              }}
            >
              {track.className}
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label={t("project.studio.rename.label")}
              value={label}
              error={Boolean(error)}
              helperText={error}
              onChange={(e) => {
                setLabel(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              sx={{
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#5297FF" },
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                  "&.Mui-focused fieldset": { borderColor: "#5297FF" },
                },
                "& .MuiFormHelperText-root": {
                  color: error ? "#f44336" : "rgba(255,255,255,0.5)",
                },
              }}
            />
          </Box>
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
          onClick={handleSave}
          disabled={!label.trim() || label.trim() === track.objectId}
        >
          {t("project.studio.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
