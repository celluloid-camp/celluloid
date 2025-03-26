"use client";

import { LoadingButton } from "@mui/lab";
import { Box, Button, DialogActions, DialogContent } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import * as Yup from "yup";

import { trpc } from "@/lib/trpc/client";
import { signIn } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();

  const utils = trpc.useUtils();

  const validationSchema = Yup.object().shape({
    username: Yup.string().required().label(t("signin.username.required")),
    password: Yup.string().required().label(t("signin.password.required")),
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

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      error: null,
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      formik.setSubmitting(true);

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
        const { error } = await signIn.username({
          username: values.username,
          password: values.password,
        });
        if (error) {
          formik.setFieldError("error", t("signin.error.user-not-found"));
          formik.setSubmitting(false);
          return;
        }
      }

      utils.project.list.invalidate();
      formik.setStatus("submited");
      formik.setSubmitting(false);
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent>
        <TextField
          id="username"
          name="username"
          margin="dense"
          fullWidth={true}
          label={t("signin.login")}
          required={true}
          value={formik.values.username}
          placeholder={t("signin.username.placeholder")}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          inputProps={{
            "data-testid": "username",
          }}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />
        <TextField
          id="password"
          inputProps={{
            "data-testid": "password",
          }}
          name="password"
          margin="dense"
          fullWidth={true}
          label={t("signin.password.placeholder")}
          required={true}
          type="password"
          value={formik.values.password}
          placeholder={t("signin.password.placeholder") || ""}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
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
      <DialogActions sx={{ marginTop: 4 }}>
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
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
            sx={{ textTransform: "uppercase" }}
          >
            {t("signin.loginAction")}
          </LoadingButton>
        </Box>
      </DialogActions>
    </form>
  );
}
