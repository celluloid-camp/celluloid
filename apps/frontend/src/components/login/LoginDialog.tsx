import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  Stack,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import * as Yup from "yup";

import { StyledDialog } from "~components/Dialog";
import { isTRPCClientError, trpc } from "~utils/trpc";

export const LoginDialog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const utils = trpc.useContext();
  const mutation = trpc.user.login.useMutation();

  const validationSchema = Yup.object().shape({
    username: Yup.string().required().label(t("signin.username")),
    password: Yup.string().required().label(t("signin.password")),
  });

  const handlePasswordReset = () => {
    navigate("/forgot", {
      state: { backgroundPath: "/" },
      replace: true,
    });
  };

  const handleConfirm = () => {
    navigate("/confirm", {
      state: { backgroundPath: "/" },
      replace: true,
    });
  };

  const handleSignup = () => {
    navigate("/signup", {
      state: { backgroundPath: "/" },
      replace: true,
    });
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
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
          email: values.email,
          password: values.password,
        });

        utils.user.me.invalidate();
        utils.project.list.invalidate();
        navigate(-1);
        formik.setStatus("submited");
      } catch (e) {
        if (isTRPCClientError(e)) {
          // `cause` is now typed as your router's `TRPCClientError`
          console.log("e.message", e.message);
          if (e.message === "UserNotConfirmed") {
            handleConfirm();
          }
        }
        formik.setFieldError("error", e.message);
      }
    },
  });

  return (
    <StyledDialog
      title={t("signin.title", "Login")}
      onClose={() => navigate(-1)}
      error={formik.errors.error}
      open={true}
      loading={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
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
            inputProps={{
              "data-testid": "username",
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
          <TextField
            id="password"
            inputProps={{
              "data-testid": "password",
            }}
            name="password"
            margin="dense"
            fullWidth={true}
            label={t("signin.password")}
            required={true}
            type="password"
            value={formik.values.password}
            placeholder={t("signin.password") || ""}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <Box display={"flex"} flex={1} justifyContent={"flex-end"}>
            <Button
              onClick={handlePasswordReset}
              data-testid="forgot-button"
              size="small"
              sx={{ textTransform: "uppercase", color: "text.secondary" }}
            >
              <Trans i18nKey="signin.forgotPasswordAction" />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ marginTop: 4 }}>
          <Box display="flex" justifyContent={"space-between"} flex={1}>
            <Box>
              {/* <Button
                color="primary"
                onClick={handleConfirm}
                size="small"
                sx={{ textTransform: "uppercase", color: "text.secondary" }}
              >
                <Trans i18nKey="signin.confirm.button">Confirm</Trans>
              </Button> */}
              <Button
                color="primary"
                data-testid="signup"
                variant="outlined"
                onClick={handleSignup}
                size="small"
                sx={{ textTransform: "uppercase", color: "text.secondary" }}
              >
                <Trans i18nKey="signin.signupAction" />
              </Button>
            </Box>

            <LoadingButton
              variant="contained"
              size="small"
              color="primary"
              type="submit"
              data-testid="submit"
              loading={mutation.isLoading}
              disabled={mutation.isLoading}
              sx={{ textTransform: "uppercase" }}
            >
              <Trans i18nKey="signin.loginAction" />
            </LoadingButton>
          </Box>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};
