"use client";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import * as Yup from "yup";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { StyledDialogTitle } from "../common/styled-dialog";

export function OtpForm({
  email,
  onClose,
}: {
  email?: string;
  onClose?: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

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
        type: "sign-in",
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

        formik.setStatus("submited");
        router.back();
        onClose?.();
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
    <>
      <StyledDialogTitle
        loading={formik.isSubmitting}
        error={formik.errors.error}
        onClose={onClose}
      >
        {t("signin.loginTitle")}
      </StyledDialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ margin: 1, padding: 2, width: 400 }}>
          <TextField
            id="username"
            name="username"
            margin="dense"
            fullWidth={true}
            label={t("confirm.username.label")}
            required={true}
            value={formik.values.username}
            slotProps={{
              htmlInput: {
                "data-testid": "username",
              },
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
            slotProps={{
              htmlInput: {
                "data-testid": "code",
              },
            }}
            placeholder={t("confirm.code.placeholder") || ""}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            onBlur={formik.handleBlur}
            error={formik.touched.code && Boolean(formik.errors.code)}
            helperText={formik.touched.code && formik.errors.code}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ marginY: 1, marginX: 2 }}>
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
    </>
  );
}
