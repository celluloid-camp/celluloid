"use client";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import * as Yup from "yup";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export const OtpForm: React.FC<{
  email?: string;
}> = ({ email }) => {
  const t = useTranslations();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // const savedProjectValue = useProjectInputIntialValue();

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(t("confirm.username.required")),
    code: Yup.string()
      .min(4, "Code is too short - should be 4 chars minimum.")
      .required(t("confirm.code.required")),
  });

  const handleResendCode = async () => {
    if (email) {
      await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "sign-in", // or "email-verification", "forget-password"
      });

      enqueueSnackbar(t("confirm.resend.success"), {
        variant: "success",
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      username: email,
      code: "",
      error: null,
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      if (!values.username) {
        formik.setFieldError("username", t("confirm.username.required"));
        return;
      }

      formik.setSubmitting(true);

      try {
        const { data, error } = await authClient.signIn.emailOtp({
          email: values.username,
          otp: values.code,
        });

        if (error) {
          formik.setFieldError("error", error.message);
          formik.setSubmitting(false);
          return;
        }

        // if (savedProjectValue.videoInfo) {
        //   navigate("/create", { replace: true });
        // } else {
        //   navigate("/", { replace: true });
        // }
        formik.setStatus("submited");
        router.push("/");
      } catch (e) {
        formik.setFieldError(
          "error",
          e instanceof Error ? e.message : "An unknown error occurred"
        );
        console.log(e);
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogTitle>{t("signin.loginTitle")}</DialogTitle>
      <DialogContent>
        <TextField
          id="username"
          name="username"
          margin="dense"
          fullWidth={true}
          label={t("confirm.username.label")}
          required={true}
          value={formik.values.username}
          inputProps={{
            "data-testid": "username",
          }}
          placeholder={t("confirm.username.paceholder") || ""}
          onChange={formik.handleChange}
          disabled={email !== undefined}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />
        <TextField
          id="code"
          name="code"
          margin="dense"
          fullWidth={true}
          label={t("confirm.code.label")}
          required={true}
          value={formik.values.code}
          inputProps={{
            "data-testid": "code",
          }}
          placeholder={t("confirm.code.placeholder") || ""}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={formik.touched.code && formik.errors.code}
        />
      </DialogContent>

      <DialogActions sx={{ marginTop: 4 }}>
        <Button variant="text" onClick={handleResendCode}>
          {t("confirm.button.resend")}
        </Button>
        <LoadingButton
          variant="contained"
          size="large"
          color="primary"
          type="submit"
          data-testid="submit"
          loading={formik.isSubmitting}
          disabled={formik.isSubmitting}
        >
          {t("confirm.button.submit")}
        </LoadingButton>
      </DialogActions>
    </form>
  );
};
