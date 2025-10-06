import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";
import { getSpriteThumbnail } from "@/lib/sprite";

interface ObjectGalleryDialogProps {
  open: boolean;
  onClose: () => void;
  objectId: string | null;
  objects: any[];
  sprite: string | undefined;
}

export function ObjectGalleryDialog({
  open,
  onClose,
  objectId,
  objects,
  sprite,
}: ObjectGalleryDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Object Detections: {objectId}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {objects.map((obj, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  component="img"
                  src={getSpriteThumbnail(sprite ?? "", obj.thumbnail)}
                  alt={objectId ?? ""}
                  sx={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 2,
                    mb: 1,
                  }}
                />
                <Typography variant="caption">
                  Timestamp: {obj.timestamp !== undefined ? obj.timestamp : ""}
                </Typography>
                <Typography variant="caption">
                  Conf: {obj.confidence?.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
