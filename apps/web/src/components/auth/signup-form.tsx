"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { Alert, DialogActions, DialogContent, Divider } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient, signUp } from "@/lib/auth-client";
import { PasswordInput } from "../common/password-input";
import { StyledDialogTitle } from "../common/styled-dialog";

export function SignupForm() {
  const t = useTranslations();
  const router = useRouter();

  const signupSchema = z
    .object({
      username: z.string().min(3, t("signup.username.length-min")),
      email: z.string().email(),
      password: z.string().min(8, t("signup.password.length-min")),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: t("password.unmatch"),
      path: ["passwordConfirmation"],
    });

  type SignupFormData = z.infer<typeof signupSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupFormData) => {
    const { data, error } = await signUp.email({
      email: values.email,
      password: values.password,
      username: values.username,
      name: values.username,
    });

    if (error) {
      if (error.code === "USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER") {
        setError("username", { message: error.message });
      } else if (error.code === "USER_ALREADY_EXISTS") {
        setError("email", { message: error.message });
      } else {
        setError("root", { message: error.message });
      }
      return;
    }

    if (!data.user.emailVerified) {
      await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "sign-in",
      });
      router.replace(`/otp?email=${values.email}`);
    } else {
      router.back();
    }
  };

  return (
    <>
      <StyledDialogTitle
        loading={isSubmitting}
        error={errors.root?.message}
        onClose={() => router.back()}
      >
        {t("signup.title")}
      </StyledDialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ margin: 1, padding: 2, width: 400 }}>
          <TextField
            {...register("username")}
            margin="dense"
            fullWidth={true}
            label={t("signup.username.label")}
            required={true}
            placeholder={t("signup.username.paceholder")}
            disabled={isSubmitting}
            error={!!errors.username}
            helperText={errors.username?.message}
            slotProps={{
              htmlInput: {
                "data-testid": "username",
              },
            }}
          />
          <TextField
            {...register("email")}
            margin="dense"
            fullWidth={true}
            type="email"
            label={t("signup.email.label")}
            required={true}
            placeholder={t("signup.email.placeholder")}
            disabled={isSubmitting}
            error={!!errors.email}
            helperText={errors.email?.message}
            slotProps={{
              htmlInput: {
                "data-testid": "email",
              },
            }}
          />
          <PasswordInput
            {...register("password")}
            margin="dense"
            fullWidth={true}
            label={t("signup.password.label")}
            required={true}
            placeholder={t("signup.password.placeholder")}
            disabled={isSubmitting}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              htmlInput: {
                "data-testid": "password",
              },
            }}
          />
          <PasswordInput
            {...register("passwordConfirmation")}
            margin="dense"
            fullWidth={true}
            label={t("signup.passwordConfirmation.label")}
            required={true}
            placeholder={t("signup.passwordConfirmation.placeholder")}
            disabled={isSubmitting}
            error={!!errors.passwordConfirmation}
            helperText={errors.passwordConfirmation?.message}
            slotProps={{
              htmlInput: {
                "data-testid": "passwordConfirmation",
              },
            }}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ marginY: 1, marginX: 2 }}>
          <LoadingButton
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            data-testid="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {t("signup.button.submit")}
          </LoadingButton>
        </DialogActions>
      </form>
    </>
  );
}
