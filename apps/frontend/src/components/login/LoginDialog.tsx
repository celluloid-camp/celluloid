import { Credentials, SigninErrors } from "@celluloid/types";
import { LoadingButton } from "@mui/lab";
import { Button, DialogActions } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { AnyAction } from "redux";
import * as Yup from "yup";

import { StyledDialog } from "~components/Dialog";
import DialogAltButtons from "~components/DialogAltButtons";
import SigninError from "~components/DialogError";
import { Action } from "~types/ActionTypes";
import { trpc } from "~utils/trpc";

export const LoginDialog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const mutation = trpc.user.login.useMutation();

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(t("signin.username.required")),
    password: Yup.string().required(t("signin.password.required")),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: null,
    },
    validateOnMount: false,
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      formik.setStatus("submited");
    },
    onReset: () => {},
  });

  return (
    <StyledDialog
      title="Login"
      onClose={() => navigate(-1)}
      error={undefined}
      open={true}
      loading={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <TextField
          id="username"
          name="username"
          margin="dense"
          fullWidth={true}
          label={t("signin.login")}
          required={true}
          value={formik.values.username}
          placeholder={t("signin.username") || ""}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />
        <TextField
          id="password"
          name="password"
          margin="dense"
          fullWidth={true}
          label={t("signin.password")}
          required={true}
          value={formik.values.password}
          placeholder={t("signin.password") || ""}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
        {/* {errors.server && <SigninError error={errors.server} />} */}

        {/* <DialogAltButtons
          heading={t("signin.notRegistered")}
          actionName={t("signin.signupAction")}
          onSubmit={onClickSignup}
        /> */}

        <DialogActions>
          {/* <Button onClick={onClickResetPassword}>
            {t("signin.forgotPasswordAction")}
          </Button> */}

          <LoadingButton
            variant="contained"
            size="large"
            color="primary"
            type="submit"
            loading={mutation.isLoading}
            disabled={mutation.isLoading}
          >
            <Trans i18nKey="signin.loginAction" />
          </LoadingButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};
