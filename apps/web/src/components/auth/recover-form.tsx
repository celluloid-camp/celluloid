"use client";

import { LoadingButton } from "@mui/lab";
import { DialogActions } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function RecoverForm({ email }: { email?: string }) {
  const t = useTranslations();
  const router = useRouter();

  const validationSchema = Yup.object().shape({
    email: Yup.string().required(t("recover.email.required")),
    code: Yup.string()
      .min(4, "Code is too short - should be 4 chars minimum.")
      .required(t("recover.code.required")),
    password: Yup.string()
      .min(8, "Password is too short - should be 8 chars minimum.")
      .required(t("recover.password.required")),
    passwordConfirmation: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Password confirmation is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: email || "",
      code: "",
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
      const { error } = await authClient.emailOtp.resetPassword({
        email: values.email,
        otp: values.code,
        password: values.password,
      });

      if (error) {
        formik.setFieldError("error", error.message);
        formik.setSubmitting(false);
        return;
      }

      await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      router.replace("/");
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        id="email"
        name="email"
        margin="dense"
        fullWidth={true}
        label={t("recover.username.label")}
        required={true}
        value={formik.values.email}
        placeholder={t("recover.username.paceholder")}
        onChange={formik.handleChange}
        disabled={formik.isSubmitting}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />
      <TextField
        id="code"
        name="code"
        margin="dense"
        fullWidth={true}
        label={t("recover.code.label")}
        required={true}
        value={formik.values.code}
        placeholder={t("recover.code.placeholder")}
        onChange={formik.handleChange}
        disabled={formik.isSubmitting}
        onBlur={formik.handleBlur}
        error={formik.touched.code && Boolean(formik.errors.code)}
        helperText={formik.touched.code && formik.errors.code}
      />
      <TextField
        id="password"
        name="password"
        margin="dense"
        type="password"
        fullWidth={true}
        label={t("recover.password.label")}
        required={true}
        value={formik.values.password}
        placeholder={t("recover.password.placeholder")}
        onChange={formik.handleChange}
        disabled={formik.isSubmitting}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />

      <TextField
        id="passwordConfirmation"
        name="passwordConfirmation"
        margin="dense"
        fullWidth={true}
        label={t("recover.passwordConfirmation.label")}
        required={true}
        type="password"
        value={formik.values.passwordConfirmation}
        placeholder={t("recover.passwordConfirmation.placeholder")}
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
      />

      <DialogActions sx={{ marginTop: 4 }}>
        <LoadingButton
          variant="contained"
          size="large"
          color="primary"
          type="submit"
          loading={formik.isSubmitting}
          disabled={formik.isSubmitting}
        >
          {t("recover.button.submit")}
        </LoadingButton>
      </DialogActions>
    </form>
  );
}
