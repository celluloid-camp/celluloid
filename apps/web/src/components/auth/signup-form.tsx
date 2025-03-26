"use client";
import { LoadingButton } from "@mui/lab";
import { Alert, DialogActions, DialogContent } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { authClient, signUp } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

export default function SignupForm() {
  const t = useTranslations();
  const router = useRouter();

  const validationSchema = Yup.object().shape({
    username: Yup.string().required().label(t("signup.username.label")),
    email: Yup.string().email().required().label(t("signup.email.label")),
    password: Yup.string().min(8).required().label(t("signup.password.label")),
    passwordConfirmation: Yup.string()
      .oneOf([Yup.ref("password")], t("password.unmatch"))
      .required()
      .label(t("signup.password.label")),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      error: null,
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      formik.setSubmitting(true);

      const { data, error } = await signUp.email({
        email: values.email,
        password: values.password,
        username: values.username,
        name: values.username,
      });

      if (error) {
        if (error.code === "ACCOUNT_EXISTS") {
          formik.setFieldError("email", error.message);
        } else {
          formik.setFieldError("error", error.message);
        }
        formik.setSubmitting(false);
        return;
      }
      if (data.user.emailVerified === false) {
        await authClient.emailOtp.sendVerificationOtp({
          email: values.email,
          type: "sign-in", // or "email-verification", "forget-password"
        });
        return router.replace(`/otp?email=${values.email}`);
      }
      router.back();

      // utils.user.me.invalidate();
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
          label={t("signup.username.label")}
          required={true}
          value={formik.values.username}
          placeholder={t("signup.username.paceholder")}
          inputProps={{
            "data-testid": "username",
          }}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />
        <TextField
          id="email"
          name="email"
          inputProps={{
            "data-testid": "email",
          }}
          margin="dense"
          fullWidth={true}
          type="email"
          label={t("signup.email.label")}
          required={true}
          value={formik.values.email}
          placeholder={t("signup.email.placeholder")}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          id="password"
          name="password"
          margin="dense"
          type="password"
          fullWidth={true}
          label={t("signup.password.label")}
          required={true}
          value={formik.values.password}
          placeholder={t("signup.password.placeholder")}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          inputProps={{
            "data-testid": "password",
          }}
        />

        <TextField
          id="passwordConfirmation"
          name="passwordConfirmation"
          margin="dense"
          fullWidth={true}
          label={t("signup.passwordConfirmation.label")}
          required={true}
          type="password"
          value={formik.values.passwordConfirmation}
          placeholder={t("signup.passwordConfirmation.placeholder")}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={
            formik.touched.passwordConfirmation &&
            Boolean(formik.errors.passwordConfirmation)
          }
          helperText={
            formik.touched.passwordConfirmation &&
            formik.errors.passwordConfirmation
          }
          inputProps={{
            "data-testid": "passwordConfirmation",
          }}
        />
        {formik.errors.error && (
          <Alert severity="error">{formik.errors.error}</Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ mx: 2 }}>
        <LoadingButton
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          data-testid="submit"
          loading={formik.isSubmitting}
          disabled={formik.isSubmitting}
        >
          {t("signup.button.submit")}
        </LoadingButton>
      </DialogActions>
    </form>
  );
}
