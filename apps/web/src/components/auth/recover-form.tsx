"use client";

import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { DialogActions, DialogContent, Divider } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PasswordInput } from "../common/password-input";
import { StyledDialogTitle } from "../common/styled-dialog";

export function RecoverForm({ email }: { email?: string }) {
  const t = useTranslations();
  const router = useRouter();

  const recoverSchema = z
    .object({
      email: z.string().min(1, t("recover.email.required")),
      code: z
        .string()
        .min(4, t("recover.code.short"))
        .min(1, t("recover.code.required")),
      password: z
        .string()
        .min(8, t("recover.password.short"))
        .min(1, t("recover.password.required")),
      passwordConfirmation: z
        .string()
        .min(1, t("recover.password.confirm.required")),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "Passwords must match",
      path: ["passwordConfirmation"],
    });

  type RecoverFormData = z.infer<typeof recoverSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RecoverFormData>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: email || "",
    },
  });

  const onSubmit = async (values: RecoverFormData) => {
    const { error } = await authClient.emailOtp.resetPassword({
      email: values.email,
      otp: values.code,
      password: values.password,
    });

    if (error && error.code === "INVALID_OTP") {
      setError("code", { message: t("recover.code.invalid") });
      return;
    }

    await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    router.replace("/");
  };

  return (
    <>
      <StyledDialogTitle loading={isSubmitting} error={errors.root?.message}>
        {t("recover.title")}
      </StyledDialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ margin: 1, padding: 2, width: 400 }}>
          <TextField
            {...register("email")}
            margin="dense"
            fullWidth={true}
            label={t("recover.username.label")}
            required={true}
            placeholder={t("recover.username.paceholder")}
            disabled={isSubmitting}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            {...register("code")}
            margin="dense"
            fullWidth={true}
            label={t("recover.code.label")}
            required={true}
            placeholder={t("recover.code.placeholder")}
            disabled={isSubmitting}
            error={!!errors.code}
            helperText={errors.code?.message}
          />
          <PasswordInput
            {...register("password")}
            margin="dense"
            fullWidth={true}
            label={t("recover.password.label")}
            required={true}
            placeholder={t("recover.password.placeholder")}
            disabled={isSubmitting}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <PasswordInput
            {...register("passwordConfirmation")}
            margin="dense"
            fullWidth={true}
            label={t("recover.passwordConfirmation.label")}
            required={true}
            placeholder={t("recover.passwordConfirmation.placeholder")}
            disabled={isSubmitting}
            error={!!errors.passwordConfirmation}
            helperText={errors.passwordConfirmation?.message}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ marginY: 1, marginX: 2 }}>
          <LoadingButton
            variant="contained"
            color="primary"
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {t("recover.button.submit")}
          </LoadingButton>
        </DialogActions>
      </form>
    </>
  );
}
