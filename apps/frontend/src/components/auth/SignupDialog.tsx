import { LoadingButton } from "@mui/lab";
import { DialogActions, DialogContent } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { authClient, signUp } from "~/lib/auth-client";

import { StyledDialog } from "~components/Dialog";
import { PasswordTextField } from "../commun/password-textfield";

export const SignupDialog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      if (data.emailVerified === false) {
        await authClient.emailOtp.sendVerificationOtp({
          email: values.email,
          type: "sign-in", // or "email-verification", "forget-password"
        });
        return navigate(`/confirm?email=${values.email}`, {
          state: { backgroundLocation: "/" },
        });
      }
      navigate(-1);

      // utils.user.me.invalidate();
    },
  });

  return (
    <StyledDialog
      title={t("signup.title", "Inscription")}
      onClose={() => navigate(-1)}
      error={formik.errors.error}
      open={true}
      loading={formik.isSubmitting}
    >
      {/* {video && user && (
        <Typography gutterBottom={true} variant="subtitle2" color="primary">
          {t("signin.upgradeAccountMessage")}
        </Typography>
      )}
      {video && !user && (
        <Typography gutterBottom={true} variant="subtitle2" color="primary">
          {t("signin.signupOrLoginMessage")}
        </Typography>
      )} */}

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <TextField
            id="username"
            name="username"
            margin="dense"
            fullWidth={true}
            label={t("signup.username.label", "Nom d'utilisateur")}
            required={true}
            value={formik.values.username}
            placeholder={
              t("signup.username.paceholder", "Nom d'utilisateur") || ""
            }
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
            label={t("signup.email.label", "Adresse email")}
            required={true}
            value={formik.values.email}
            placeholder={t("signup.email.placeholder", "Adresse email") || ""}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <PasswordTextField
            id="password"
            name="password"
            margin="dense"
            fullWidth={true}
            label={t("signup.password.label", "Mot de passe")}
            required={true}
            value={formik.values.password}
            placeholder={t("signup.password.placeholder", "Mot de passe")}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            inputProps={{
              "data-testid": "password",
            }}
          />

          <PasswordTextField
            id="passwordConfirmation"
            name="passwordConfirmation"
            margin="dense"
            fullWidth={true}
            label={t(
              "signup.passwordConfirmation.label",
              "Confirmer le mot de passe"
            )}
            required={true}
            value={formik.values.passwordConfirmation}
            placeholder={t(
              "signup.passwordConfirmation.placeholder",
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
            inputProps={{
              "data-testid": "passwordConfirmation",
            }}
          />
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
            <Trans i18nKey="signup.button.submit">S'inscrire</Trans>
          </LoadingButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};
