"use client";

import {
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTRPC } from "@/lib/trpc/client";

type ConnectInstanceDialogProps = {
  host: string;
  instanceTitle?: string;
  onStatusChange?: () => void;
  triggerVariant?: "text" | "outlined" | "contained";
};

export function ConnectInstanceDialog({
  host,
  instanceTitle,
  onStatusChange,
  triggerVariant = "outlined",
}: ConnectInstanceDialogProps) {
  const t = useTranslations("project.create");
  const api = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { data: authStatus } = useQuery({
    ...api.peertubeInstance.authStatus.queryOptions({ host }),
    enabled: Boolean(host),
  });

  const connectMutation = useMutation(
    api.peertubeInstance.connect.mutationOptions({
      onSuccess: () => {
        setEmail("");
        setPassword("");
        setOpen(false);
        void queryClient.invalidateQueries({
          queryKey: [["peertubeInstance"]],
        });
        onStatusChange?.();
      },
    }),
  );

  const isConnected = authStatus?.status === "connected";

  if (isConnected) {
    return (
      <Chip color="success" label={t("connected")} size="small" variant="outlined" />
    );
  }

  const handleConnect = () => {
    if (!(email.trim() && password)) {
      return;
    }
    connectMutation.mutate({
      host,
      email: email.trim(),
      password,
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="small"
        type="button"
        variant={triggerVariant}
      >
        {t("connect")}
      </Button>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEmail("");
          setPassword("");
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("connectTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText className="mb-4">
            {instanceTitle
              ? t("connectDescriptionWithTitle", { title: instanceTitle })
              : t("connectDescription")}
          </DialogContentText>
          <TextField
            autoFocus
            autoComplete="username"
            fullWidth
            label={t("emailLabel")}
            margin="dense"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
          <TextField
            autoComplete="current-password"
            fullWidth
            label={t("passwordLabel")}
            margin="dense"
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleConnect();
              }
            }}
            type="password"
            value={password}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} type="button">
            {t("cancel")}
          </Button>
          <Button
            disabled={!(email.trim() && password) || connectMutation.isPending}
            onClick={handleConnect}
            type="button"
            variant="contained"
          >
            {t("connect")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function ConnectionStatusBadge({ status }: { status: string | null }) {
  const t = useTranslations("project.create");

  if (!status) {
    return null;
  }

  if (status === "connected") {
    return (
      <Chip color="success" label={t("connected")} size="small" variant="outlined" />
    );
  }

  if (status === "expired") {
    return (
      <Chip color="warning" label={t("expired")} size="small" variant="outlined" />
    );
  }

  return (
    <Chip color="error" label={t("failed")} size="small" variant="outlined" />
  );
}
