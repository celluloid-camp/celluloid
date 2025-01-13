import { LoadingButton } from "@mui/lab";
import { DialogActions } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { authClient } from "~/lib/auth-client";

import { StyledDialog } from "~components/Dialog";
import { useRouteQuery } from "~hooks/useRouteQuery";
import { PasswordTextField } from "../commun/password-textfield";

export const RecoverDialog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useRouteQuery();

  const validationSchema = Yup.object().shape({
    email: Yup.string().required(t("recorver.email.required")),
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
  const queryEmail = query.get("email") || undefined;

  const formik = useFormik({
    initialValues: {
      email: queryEmail,
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

      navigate("/");
    },
  });

  return (
    <StyledDialog
      title={t("recover.title", "Récupérer le compte")}
      onClose={() => navigate(-1)}
      error={formik.errors.error}
      open={true}
      loading={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <TextField
          id="email"
          name="email"
          margin="dense"
          fullWidth={true}
          label={t("recover.username.label", "Email ou nom d'utilisateur")}
          required={true}
          value={formik.values.email}
          placeholder={
            t("recover.username.paceholder", "Email ou nom d'utilisateur") || ""
          }
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
          label={t("recover.code.label", "Code de confirmation")}
          required={true}
          value={formik.values.code}
          placeholder={
            t("recover.code.placeholder", "Code de confirmation") || ""
          }
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={formik.touched.code && formik.errors.code}
        />
        <PasswordTextField
          id="password"
          name="password"
          margin="dense"
          fullWidth={true}
          label={t("recover.password.label", " Mot de passe")}
          required={true}
          value={formik.values.password}
          placeholder={t("recover.password.placeholder", " Mot de passe")}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />

        <PasswordTextField
          id="passwordConfirmation"
          name="passwordConfirmation"
          margin="dense"
          fullWidth={true}
          label={t(
            "recover.passwordConfirmation.label",
            "Confirmer le mot de passe"
          )}
          required={true}
          value={formik.values.passwordConfirmation}
          placeholder={t(
            "recover.passwordConfirmation.placeholder",
            "Confirmer le mot de passe"
          )}
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
            <Trans i18nKey="recover.button.submit">Envoyer</Trans>
          </LoadingButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};
