"use client";

import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/lib/trpc/client";
import { signIn } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PasswordTextField } from "../common/password-textfield";
import { StyledDialogTitle } from "../common/styled-dialog";

export function LoginForm({ onClose }: { onClose?: () => void }) {
  const t = useTranslations();
  const router = useRouter();
  const utils = trpc.useUtils();

  const loginSchema = z.object({
    username: z.string().min(1, t("signin.username.required")),
    password: z.string().min(1, t("signin.password.required")),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handlePasswordReset = () => {
    router.replace("/forgot");
  };

  const handleConfirm = (email?: string) => {
    router.replace(`/otp?email=${email}`);
  };

  const handleSignup = () => {
    router.replace("/signup");
  };

  const onSubmit = async (values: LoginFormData) => {
    const { error } = await signIn.email({
      email: values.username,
      password: values.password,
    });

    if (error?.code === "EMAIL_NOT_VERIFIED") {
      await authClient.emailOtp.sendVerificationOtp({
        email: values.username,
        type: "sign-in",
      });
      return handleConfirm(values.username);
    }

    if (error) {
      const { error: usernameError } = await signIn.username({
        username: values.username,
        password: values.password,
      });
      if (usernameError) {
        setError("root", { message: t("signin.error.user-not-found") });
        return;
      }
    }

    utils.project.list.invalidate();
    router.back();
    onClose?.();
  };

  return (
    <>
      <StyledDialogTitle
        loading={isSubmitting}
        error={errors.root?.message}
        onClose={onClose}
      >
        {t("signin.title")}
      </StyledDialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ margin: 1, padding: 2, width: 400 }}>
          <TextField
            {...register("username")}
            margin="dense"
            fullWidth={true}
            label={t("signin.login")}
            required={true}
            placeholder={t("signin.username.placeholder")}
            disabled={isSubmitting}
            slotProps={{
              htmlInput: {
                "data-testid": "username",
              },
            }}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <PasswordTextField
            {...register("password")}
            margin="dense"
            fullWidth={true}
            label={t("signin.password.placeholder")}
            required={true}
            placeholder={t("signin.password.placeholder") || ""}
            disabled={isSubmitting}
            slotProps={{
              htmlInput: {
                "data-testid": "password",
              },
            }}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Box display={"flex"} flex={1} justifyContent={"flex-end"}>
            <Button
              onClick={handlePasswordReset}
              data-testid="forgot-button"
              size="small"
              sx={{ textTransform: "uppercase", color: "text.secondary" }}
            >
              {t("signin.forgotPasswordAction")}
            </Button>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ marginY: 1, marginX: 2 }}>
          <Box display="flex" justifyContent={"space-between"} flex={1}>
            <Box>
              <Button
                color="primary"
                data-testid="signup"
                variant="outlined"
                onClick={handleSignup}
                size="small"
                sx={{ textTransform: "uppercase", color: "text.secondary" }}
              >
                {t("signin.signupAction")}
              </Button>
            </Box>

            <LoadingButton
              variant="contained"
              size="small"
              color="primary"
              type="submit"
              data-testid="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              sx={{ textTransform: "uppercase" }}
            >
              {t("signin.loginAction")}
            </LoadingButton>
          </Box>
        </DialogActions>
      </form>
    </>
  );
}
