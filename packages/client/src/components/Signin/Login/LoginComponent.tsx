import { Credentials, SigninErrors } from "@celluloid/types";
import { Button, DialogActions } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import { AnyAction } from "redux";

import DialogAltButtons from "~components/DialogAltButtons";
import SigninError from "~components/DialogError";
import { Action } from "~types/ActionTypes";

interface Props {
  credentials: Credentials;
  errors: SigninErrors;
  onChange(name: string, value: string): void;
  onClickResetPassword(): Action<null>;
  onClickSignup(): Action<null>;
  onSubmit(): Promise<AnyAction>;
}

const LoginComponent = ({
  credentials,
  errors,
  onChange,
  onClickResetPassword,
  onClickSignup,
  onSubmit,
}: Props) => {
  const { t } = useTranslation();
  return (
    <div>
      <TextField
        margin="dense"
        fullWidth={true}
        label={t("signin.login")}
        required={true}
        id="username"
        value={credentials.login}
        error={errors.login ? true : false}
        onChange={(event) => onChange("login", event.target.value)}
        helperText={errors && errors.login}
      />
      <TextField
        margin="dense"
        fullWidth={true}
        label={t("signin.password")}
        required={true}
        value={credentials.password}
        type="password"
        error={errors.password ? true : false}
        onChange={(event) => onChange("password", event.target.value)}
        helperText={errors && errors.password}
      />
      {errors.server && <SigninError error={errors.server} />}

      <DialogAltButtons
        heading={t("signin.notRegistered")}
        actionName={t("signin.signupAction")}
        onSubmit={onClickSignup}
      />

      <DialogActions>
        <Button onClick={onClickResetPassword}>
          {t("signin.forgotPasswordAction")}
        </Button>
        <Button autoFocus onClick={onSubmit} variant="contained">
          {t("signin.loginAction")}
        </Button>
      </DialogActions>
    </div>
  );
};

export default LoginComponent;
