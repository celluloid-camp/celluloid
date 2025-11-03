"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import DeleteIcon from "@mui/icons-material/Delete";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
} from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import type * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  BootstrapDialog,
  StyledDialogTitle,
} from "@/components/common/styled-dialog";
import { trpc } from "@/lib/trpc/client";

interface EditPlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  playlist: {
    id: string;
    title: string;
    description: string;
  };
}

const EditPlaylistDialog: React.FC<EditPlaylistDialogProps> = ({
  open,
  onClose,
  playlist,
}) => {
  const t = useTranslations();
  const confirm = useConfirm();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const utils = trpc.useUtils();

  const schema = z.object({
    title: z.string().min(1, t("playlist.edit.title") || "Title required"),
    description: z.string(),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: playlist.title,
      description: playlist.description,
    },
  });

  const updateMutation = trpc.playlist.update.useMutation({
    onSuccess: () => {
      utils.user.playlists.invalidate();
      enqueueSnackbar(t("playlist.edit.success"), {
        variant: "success",
      });
      onClose();
    },
    onError: () => {
      enqueueSnackbar(t("playlist.edit.error"), {
        variant: "error",
      });
    },
  });

  const deleteMutation = trpc.playlist.delete.useMutation({
    onSuccess: () => {
      utils.user.playlists.invalidate();
      enqueueSnackbar(t("playlist.delete.success"), {
        variant: "success",
      });
      onClose();
      router.push("/profile");
    },
    onError: () => {
      enqueueSnackbar(t("playlist.delete.error"), {
        variant: "error",
      });
    },
  });

  const handleDelete = async () => {
    try {
      await confirm({
        title: t("playlist.delete.confirm.title"),
        description: t("playlist.delete.confirm.description"),
        confirmationText: t("deleteAction"),
        cancellationText: t("cancelAction"),
        confirmationButtonProps: {
          variant: "contained",
          color: "error",
        },
      });
      deleteMutation.mutate({ id: playlist.id });
    } catch (error) {
      // User cancelled
    }
  };

  const onSubmit = (data: FormValues) => {
    updateMutation.mutate({
      id: playlist.id,
      title: data.title,
      description: data.description,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BootstrapDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="body"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <StyledDialogTitle onClose={handleClose}>
          {t("playlist.edit.dialog.title")}
        </StyledDialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label={t("playlist.edit.title")}
              {...register("title")}
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t("playlist.edit.description")}
              {...register("description")}
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {t("playlist.delete.button")}
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={handleClose} disabled={isSubmitting}>
              {t("playlist.edit.cancel")}
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={updateMutation.isPending}
              disabled={isSubmitting}
            >
              {t("playlist.edit.submit")}
            </LoadingButton>
          </Stack>
        </DialogActions>
      </form>
    </BootstrapDialog>
  );
};

export default EditPlaylistDialog;
