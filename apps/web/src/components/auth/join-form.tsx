"use client";
import { LoadingButton } from "@mui/lab";
import { DialogActions, DialogContent } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { isTRPCClientError, trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const joinFormSchema = z.object({
  shareCode: z.string().min(4, "Share code is required"),
});

type JoinFormValues = z.infer<typeof joinFormSchema>;

export function JoinForm() {
  const t = useTranslations();
  const router = useRouter();

  const utils = trpc.useUtils();
  const mutation = trpc.user.joinProject.useMutation();

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
      const data = await mutation.mutateAsync({
        shareCode: values.shareCode,
      });

      utils.user.me.invalidate();

      if (data.projectId) {
        router.push(`/project/${data.projectId}`);
      } else {
        router.push("/");
      }
    } catch (e) {
      if (isTRPCClientError(e)) {
        if (e.message === "PROJECT_OWNER_CANNOT_JOIN") {
          setError("root", {
            message: t("join.error.project-owner-cannot-join"),
          });
        } else if (e.message === "CODE_NOT_FOUND") {
          setError("shareCode", {
            message: t("join.error.project-not-found"),
          });
        }
      } else {
        setError("root", {
          message: t("join.error.project-not-found"),
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogContent>
        <TextField
          id="shareCode"
          margin="dense"
          fullWidth
          label={t("join.shareCode.label")}
          required
          placeholder={t("join.shareCode.placeholder")}
          disabled={isSubmitting}
          error={!!errors.shareCode || !!errors.root}
          helperText={errors.shareCode?.message || errors.root?.message}
          {...register("shareCode")}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          color="primary"
          type="submit"
          data-testid="submit"
          loading={mutation.isPending}
          disabled={mutation.isPending}
        >
          {t("join.button.submit")}
        </LoadingButton>
      </DialogActions>
    </form>
  );
}
