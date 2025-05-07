"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import {
  DialogActions,
  DialogContent,
  Divider,
  Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isTRPCClientError, trpc } from "@/lib/trpc/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { StyledDialogTitle } from "../common/styled-dialog";

export function JoinForm() {
  const t = useTranslations();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const joinFormSchema = z.object({
    shareCode: z.string().min(4, t("join.code.required")),
  });

  type JoinFormValues = z.infer<typeof joinFormSchema>;

  const utils = trpc.useUtils();
  const mutation = trpc.user.joinProject.useMutation({
    onSuccess: (data) => {
      enqueueSnackbar(t("join.message.success"), {
        variant: "success",
      });
      router.push(`/project/${data.projectId}`);
      utils.user.me.invalidate();
    },
    onError: (error) => {
      if (isTRPCClientError(error)) {
        if (error.message === "PROJECT_OWNER_CANNOT_JOIN") {
          setError("shareCode", {
            message: t("join.error.project-owner-cannot-join"),
          });
        } else if (error.message === "CODE_NOT_FOUND") {
          setError("shareCode", {
            message: t("join.error.project-not-found"),
          });
        }
      } else {
        setError("shareCode", {
          message: t("join.error.project-not-found"),
        });
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinFormSchema),
  });

  const onSubmit = async (values: JoinFormValues) => {
    try {
      await mutation.mutateAsync({
        shareCode: values.shareCode,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <StyledDialogTitle loading={isSubmitting} onClose={() => router.back()}>
        {t("join.title")}
      </StyledDialogTitle>
      <Typography variant="body1" sx={{ margin: 3, color: "gray" }}>
        {t("join.description")}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ margin: 1, width: 400 }}>
          <TextField
            id="shareCode"
            margin="dense"
            fullWidth
            variant="outlined"
            label={t("join.shareCode.label")}
            placeholder={t("join.shareCode.placeholder")}
            disabled={isSubmitting}
            error={!!errors.shareCode || !!errors.root}
            helperText={errors.shareCode?.message || errors.root?.message}
            {...register("shareCode")}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ marginY: 1, marginX: 2 }}>
          <LoadingButton
            variant="contained"
            color="primary"
            type="submit"
            data-testid="submit"
            loading={mutation.isPending || isSubmitting}
            disabled={mutation.isPending || isSubmitting}
          >
            {t("join.button.submit")}
          </LoadingButton>
        </DialogActions>
      </form>
    </>
  );
}
