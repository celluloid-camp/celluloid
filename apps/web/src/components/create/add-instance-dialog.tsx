"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTRPC } from "@/lib/trpc/client";

type AddInstanceDialogProps = {
  onAdded?: () => void;
  open: boolean;
  onClose: () => void;
};

export function AddInstanceDialog({
  open,
  onClose,
  onAdded,
}: AddInstanceDialogProps) {
  const t = useTranslations("project.create");
  const api = useTRPC();
  const queryClient = useQueryClient();
  const [host, setHost] = useState("");

  const addInstance = useMutation(
    api.peertubeInstance.addOwn.mutationOptions({
      onSuccess: () => {
        setHost("");
        onClose();
        void queryClient.invalidateQueries({
          queryKey: [["peertubeInstance"]],
        });
        onAdded?.();
      },
    }),
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = host.trim();
    if (!trimmed) {
      return;
    }
    addInstance.mutate({ host: trimmed });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t("addInstanceTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText className="mb-4">
            {t("addInstanceDescription")}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label={t("instanceUrlLabel")}
            onChange={(event) => setHost(event.target.value)}
            placeholder="https://peertube.example.com"
            required
            type="url"
            value={host}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} type="button">
            {t("cancel")}
          </Button>
          <Button
            disabled={!host.trim() || addInstance.isPending}
            type="submit"
            variant="contained"
          >
            {t("addInstance")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
