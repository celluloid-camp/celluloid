"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient, useSession } from "@/lib/auth-client";
import { StyledDialogTitle } from "../common/styled-dialog";

export function OtpForm() {
  const t = useTranslations();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") as string;
  const { refetch } = useSession();

  const otpSchema = z.object({
    email: z.string(),
    code: z.string().min(4, t("recover.code.short")),
  });
  type OtpFormValues = z.infer<typeof otpSchema>;

  const handleResendCode = async () => {
    if (email) {
      await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "sign-in",
      });

      enqueueSnackbar(t("confirm.resend.success"), {
        variant: "success",
      });
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: email ?? "",
      code: "",
    },
  });

  useEffect(() => {
    reset((values) => ({ ...values, email: email ?? "" }));
  }, [email, reset]);

  const onSubmit = async (values: OtpFormValues) => {
    try {
      const { error } = await authClient.signIn.emailOtp({
        email: values.email,
        otp: values.code,
      });
      if (error?.code === "INVALID_OTP") {
        setError("root", { message: t("otp.form.invalid-code") });
        return;
      }
      enqueueSnackbar(t("otp.form.success"), {
        variant: "success",
      });
      await refetch();
      router.back();
    } catch (e) {
      setError("root", {
        message: e instanceof Error ? e.message : "An unknown error occurred",
      });
    }
  };

  return (
    <>
      <StyledDialogTitle
        loading={isSubmitting}
        error={errors.root?.message}
        onClose={() => router.back()}
      >
        {t("otp.form.title")}
      </StyledDialogTitle>
      <Typography variant="body1" sx={{ padding: 3, color: "gray" }}>
        {t("otp.form.description")}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ margin: 1, padding: 2, width: 400 }}>
          <TextField
            id="email"
            margin="dense"
            fullWidth={true}
            label={t("confirm.username.label")}
            value={email ?? ""}
            disabled={true}
            slotProps={{
              htmlInput: {
                "data-testid": "email",
              },
            }}
            placeholder={t("confirm.username.placeholder") || ""}
            {...register("email")}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
          <TextField
            id="code"
            margin="dense"
            fullWidth={true}
            label={t("confirm.code.label")}
            slotProps={{
              htmlInput: {
                "data-testid": "code",
              },
            }}
            placeholder={t("confirm.code.placeholder") || ""}
            {...register("code")}
            disabled={isSubmitting}
            error={Boolean(errors.code)}
            helperText={errors.code?.message}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ marginY: 1, marginX: 2 }}>
          <Button
            variant="text"
            disabled={isSubmitting}
            onClick={handleResendCode}
          >
            {t("confirm.button.resend")}
          </Button>
          <Button
            variant="contained"
            size="large"
            color="primary"
            type="submit"
            data-testid="submit-otp"
            loading={isSubmitting}
          >
            {t("confirm.button.submit")}
          </Button>
        </DialogActions>
      </form>
    </>
  );
}
