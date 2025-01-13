import { LoadingButton } from "@mui/lab";
import { Box, Button, DialogActions, DialogContent } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { authClient } from "~/lib/auth-client";

import { StyledDialog } from "~components/Dialog";
import { isTRPCClientError, trpc } from "~utils/trpc";
import { PasswordTextField } from "../commun/password-textfield";

export const StudentSignupDialog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // const utils = trpc.useContext();
  const mutation = trpc.user.joinProject.useMutation();

  const validationSchema = Yup.object().shape({
    shareCode: Yup.string().required(),
    username: Yup.string().min(4).required(),
    password: Yup.string().min(8).required(),
  });

  const handleSignin = () => {
    navigate("/login", {
      state: { backgroundLocation: "/" },
    });
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      shareCode: "",
      error: null,
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        formik.setSubmitting(true);
        const { error } = await authClient.signUpAsStudent({
          username: values.username,
          password: values.password,
        });

        if (error) {
          if (error.code === "USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER") {
            formik.setFieldError("username", t("join.error.username-taken"));
          }
          return;
        }
        const { projectId } = await mutation.mutateAsync({
          shareCode: values.shareCode,
        });

        if (projectId) {
          navigate(`/project/${projectId}`);
        } else {
          navigate("/");
        }
        formik.setStatus("submited");
        // utils.user.me.invalidate();
      } catch (e) {
        if (isTRPCClientError(e)) {
          // `cause` is now typed as your router's `TRPCClientError`
          if (e.message === "PROJECT_OWNER_CANNOT_JOIN") {
            // `cause` is now typed as your router's `TRPCClientError`
            formik.setFieldError(
              "shareCode",
              t("join.error.project-owner-cannot-join")
            );
          } else if (e.message === "CODE_NOT_FOUND") {
            formik.setFieldError(
              "shareCode",
              t("join.error.project-not-found", "Code de partage est invalide")
            );
            navigate("/join", { replace: true });
          }
        } else {
          formik.setFieldError(
            "error",
            t("join.error.project-not-found", "Code de partage est invalide")
          );
        }
      }
    },
  });

  return (
    <StyledDialog
      title={t("student-signup.title", "Inscription")}
      onClose={() => navigate(-1)}
      error={formik.errors.error}
      open={true}
      loading={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ mt: 0 }}>
          <TextField
            id="shareCode"
            name="shareCode"
            margin="dense"
            fullWidth={true}
            label={t(
              "student-student-signup.shareCode.label",
              "Code du projet"
            )}
            required={true}
            value={formik.values.shareCode}
            placeholder={
              t("student-signup.shareCode.placeholder", "Code du projet") || ""
            }
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            onBlur={formik.handleBlur}
            error={formik.touched.shareCode && Boolean(formik.errors.shareCode)}
            helperText={formik.touched.shareCode && formik.errors.shareCode}
            inputProps={{
              "data-testid": "shareCode",
            }}
          />

          <TextField
            id="username"
            name="username"
            margin="dense"
            fullWidth={true}
            label={t(
              "student-student-signup.username.label",
              "Prenom ou pseudo"
            )}
            required={true}
            value={formik.values.username}
            placeholder={
              t(
                "student-student-signup.username.paceholder",
                "Prenom ou pseudo"
              ) || ""
            }
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            inputProps={{
              "data-testid": "username",
            }}
          />

          <PasswordTextField
            id="password"
            name="password"
            margin="dense"
            fullWidth={true}
            label={t("student-signup.password.label", "Mot de passe")}
            required={true}
            value={formik.values.password}
            placeholder={t(
              "student-signup.password.placeholder",
              "Mot de passe"
            )}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            inputProps={{
              "data-testid": "password",
            }}
          />
        </DialogContent>
        <DialogActions sx={{ mx: 2, mt: 2 }}>
          <Box display="flex" justifyContent={"space-between"} flex={1}>
            <Box>
              <Button
                color="primary"
                onClick={handleSignin}
                data-testid="login-button"
                size="small"
                variant="outlined"
                sx={{ textTransform: "uppercase", color: "text.secondary" }}
              >
                <Trans i18nKey="student-signup.login.button">
                  Se connecter
                </Trans>
              </Button>
            </Box>

            <LoadingButton
              variant="contained"
              color="primary"
              type="submit"
              data-testid="submit-button"
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}
            >
              <Trans i18nKey="student-signup.button.submit">Rejoindre</Trans>
            </LoadingButton>
          </Box>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};
