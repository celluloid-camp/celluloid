"use client";

import { LoadingButton } from "@mui/lab";
import { Box, Button, DialogActions } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function ForgotForm() {
  const t = useTranslations();
  const router = useRouter();

  const validationSchema = Yup.object().shape({
    email: Yup.string().required(t("forgot.email.required")),
  });

  const handleRecover = (email?: string) => {
    router.replace(`/recover?email=${email}`);
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      error: null,
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "forget-password", // or "email-verification", "forget-password"
      });

      if (error) {
        formik.setFieldError("error", error.message);
        formik.setSubmitting(false);
        return;
      }

      handleRecover(values.email);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        id="email"
        name="email"
        margin="dense"
        fullWidth={true}
        required={true}
        value={formik.values.email}
        placeholder={t("forgot.email.placeholder")}
        onChange={formik.handleChange}
        disabled={formik.isSubmitting}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />

      <DialogActions sx={{ marginTop: 4 }}>
        <Box display="flex" justifyContent={"space-between"} flex={1}>
          <Button
            color="primary"
            onClick={() => handleRecover(formik.values.email)}
            variant="text"
          >
            {t("forgot.button.recover")}
          </Button>
          <LoadingButton
            variant="contained"
            size="large"
            color="primary"
            type="submit"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            {t("forgot.button.submit")}
          </LoadingButton>
        </Box>
      </DialogActions>
    </form>
  );
}
