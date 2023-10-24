import { LoadingButton } from "@mui/lab";
import { Box, Button, DialogActions } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import * as Yup from "yup";

import { StyledDialog } from "~components/Dialog";
import { trpc } from "~utils/trpc";

export const ForgotDialog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const utils = trpc.useContext();
  const mutation = trpc.user.forgot.useMutation();

  const validationSchema = Yup.object().shape({
    email: Yup.string().required(t("forgot.email.required")),
  });

  const handleRecover = () => {
    navigate("/recover", {
      state: { backgroundLocation: "/" },
      replace: true,
    });
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
      try {
        await mutation.mutateAsync({
          email: values.email,
        });

        utils.user.me.invalidate();
        handleRecover();
        formik.setStatus("submited");
      } catch (e) {
        formik.setFieldError("error", e.message);
        console.log(e);
      }
    },
  });

  return (
    <StyledDialog
      title={t("forgot.title", "Mot de passe perdu")}
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
          required={true}
          value={formik.values.email}
          placeholder={
            t("forgot.email.placeholder", "Email ou nom d'utilisateur") || ""
          }
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />

        <DialogActions sx={{ marginTop: 4 }}>
          <Box display="flex" justifyContent={"space-between"} flex={1}>
            <Button color="primary" onClick={handleRecover} variant="text">
              <Trans i18nKey="forgot.button.recover">Récupérer un compte</Trans>
            </Button>
            <LoadingButton
              variant="contained"
              size="large"
              color="primary"
              type="submit"
              loading={mutation.isLoading}
              disabled={mutation.isLoading}
            >
              <Trans i18nKey="forgot.button.submit">
                Changer le mot de passe
              </Trans>
            </LoadingButton>
          </Box>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};
