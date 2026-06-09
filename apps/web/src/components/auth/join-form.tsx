"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DialogActions,
  DialogContent,
  Divider,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTRPC } from "@/lib/trpc/client";
import { StyledDialogTitle } from "../common/styled-dialog";

export function JoinForm() {
  const t = useTranslations();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [shareCodeQuery] = useQueryState("code");

  const joinFormSchema = z.object({
    shareCode: z.string().min(4, t("join.code.required")),
  });

  type JoinFormValues = z.infer<typeof joinFormSchema>;

  const api = useTRPC();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    api.user.joinProject.mutationOptions({
      onSuccess: (data) => {
        enqueueSnackbar(t("join.message.success"), {
          variant: "success",
        });
        router.push(`/project/${data.projectId}`);
        queryClient.invalidateQueries(api.user.me.queryFilter());
      },
      onError: (error) => {
        if (error instanceof TRPCClientError) {
          console.log("error", error);
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
    }),
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      shareCode: shareCodeQuery ?? "",
    },
  });

  useEffect(() => {
    if (shareCodeQuery) {
      reset({ shareCode: shareCodeQuery });
    }
  }, [shareCodeQuery, reset]);

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
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ width: 400 }}>
          <Typography variant="body2">{t("join.description")}</Typography>
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
          <Button
            variant="contained"
            color="primary"
            type="submit"
            data-testid="submit"
            loading={mutation.isPending || isSubmitting}
          >
            {t("join.button.submit")}
          </Button>
        </DialogActions>
      </form>
    </>
  );
}
