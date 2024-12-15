import { LoadingButton } from "@mui/lab";
import { DialogActions, Link } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { authClient } from "~/lib/auth-client";

import { useProjectInputIntialValue } from "~/state";
import { StyledDialog } from "~components/Dialog";
import { useRouteQuery } from "~hooks/useRouteQuery";

export const ConfirmDialog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useRouteQuery();
  const { enqueueSnackbar } = useSnackbar();

  const savedProjectValue = useProjectInputIntialValue();

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(t("confirm.username.required")),
    code: Yup.string()
      .min(4, "Code is too short - should be 4 chars minimum.")
      .required(t("confirm.code.required")),
  });

  const queryEmail = query.get("email") || undefined;

  const handleResendCode = async () => {
    if (queryEmail) {
      await authClient.sendVerificationEmail({
        email: queryEmail,
        // callbackURL: "/" // The redirect URL after verification
      });

      enqueueSnackbar(t("confirm.resend.success", "Code envoyé"), {
        variant: "success",
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      username: queryEmail,
      code: "",
      error: null,
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        authClient.verifyEmail({
          query: {
            token: values.code,
          },
        });

        if (savedProjectValue.videoInfo) {
          navigate("/create", { replace: true });
        } else {
          navigate("/", { replace: true });
        }

        formik.setStatus("submited");
      } catch (e) {
        formik.setFieldError("error", e.message);
        console.log(e);
      }
    },
  });

  return (
    <StyledDialog
      title={t("confirm.title", "Confirmation")}
      onClose={() => navigate(-1)}
      error={formik.errors.error}
      open={true}
      loading={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <TextField
          id="username"
          name="username"
          margin="dense"
          fullWidth={true}
          label={t("confirm.username.label", "Email ou nom d'utilisateur")}
          required={true}
          value={formik.values.username}
          inputProps={{
            "data-testid": "username",
          }}
          placeholder={
            t("confirm.username.paceholder", "Email ou nom d'utilisateur") || ""
          }
          onChange={formik.handleChange}
          disabled={queryEmail !== undefined}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />
        <TextField
          id="code"
          name="code"
          margin="dense"
          fullWidth={true}
          label={t("confirm.code.label", "Code de confirmation")}
          required={true}
          value={formik.values.code}
          inputProps={{
            "data-testid": "code",
          }}
          placeholder={
            t("confirm.code.placeholder", "Code de confirmation") || ""
          }
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={formik.touched.code && formik.errors.code}
        />

        <DialogActions sx={{ marginTop: 4 }}>
          <Link variant="body2" onClick={handleResendCode}>
            <Trans i18nKey="confirm.button.send">Renvoyer le code ?</Trans>
          </Link>
          <LoadingButton
            variant="contained"
            size="large"
            color="primary"
            type="submit"
            data-testid="submit"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            <Trans i18nKey="confirm.button.submit">Envoyer</Trans>
          </LoadingButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};
