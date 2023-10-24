import { LoadingButton } from "@mui/lab";
import { Alert, Box, Button, DialogActions, Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import * as Yup from "yup";

import { StyledDialog } from "~components/Dialog";
import { trpc } from "~utils/trpc";

export const RecoverDialog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const utils = trpc.useContext();
  const mutation = trpc.user.recover.useMutation();

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(t("recover.username.required")),
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
      username: "",
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
      try {
        await mutation.mutateAsync({
          username: values.username,
          password: values.password,
          code: values.code,
        });

        utils.user.me.invalidate();
        navigate("/");
        formik.setStatus("submited");
      } catch (e) {
        formik.setFieldError("error", e.message);
        console.log(e);
      }
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
          id="username"
          name="username"
          margin="dense"
          fullWidth={true}
          label={t("recover.username.label", "Email ou nom d'utilisateur")}
          required={true}
          value={formik.values.username}
          placeholder={
            t("recover.username.paceholder", "Email ou nom d'utilisateur") || ""
          }
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
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
        <TextField
          id="password"
          name="password"
          margin="dense"
          type="password"
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

        <TextField
          id="passwordConfirmation"
          name="passwordConfirmation"
          margin="dense"
          fullWidth={true}
          label={t(
            "recover.passwordConfirmation.label",
            "Confirmer le mot de passe"
          )}
          required={true}
          type="password"
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
            loading={mutation.isLoading}
            disabled={mutation.isLoading}
          >
            <Trans i18nKey="recover.button.submit">Envoyer</Trans>
          </LoadingButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};
