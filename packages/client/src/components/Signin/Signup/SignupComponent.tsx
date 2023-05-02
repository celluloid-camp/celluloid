import { SigninErrors, TeacherSignupData, UserRecord } from "@celluloid/types";
import { Button, DialogActions, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import { AnyAction } from "redux";

import DialogAltButtons from "~components/DialogAltButtons";
import DialogButtons from "~components/DialogButtons";
import DialogError from "~components/DialogError";
import { Action } from "~types/ActionTypes";
import { PeertubeVideoInfo } from "~types/YoutubeTypes";

interface Props {
  user?: UserRecord;
  video?: PeertubeVideoInfo;
  data: TeacherSignupData;
  errors: SigninErrors;
  confirmPasswordError: boolean;
  onChange(name: string, value: string): void;
  onClickLogin(): Action<null>;
  onSubmit(): Promise<AnyAction>;
}

const SignupComponent = ({
  data,
  user,
  video,
  errors,
  confirmPasswordError,
  onChange,
  onSubmit,
  onClickLogin,
}: Props) => {
  const { t } = useTranslation();
  return (
    <div>
      {video && user && (
        <Typography gutterBottom={true} variant="subtitle2" color="primary">
          {t("signin.upgradeAccountMessage")}
        </Typography>
      )}
      {video && !user && (
        <Typography gutterBottom={true} variant="subtitle2" color="primary">
          {t("signin.signupOrLoginMessage")}
        </Typography>
      )}
      <TextField
        margin="dense"
        fullWidth={true}
        error={errors.username ? true : false}
        label={t("signin.username")}
        value={data.username}
        required={true}
        onChange={(event) => onChange("username", event.target.value)}
        helperText={errors && errors.username}
      />
      <TextField
        margin="dense"
        fullWidth={true}
        error={errors.email ? true : false}
        label={t("signin.email")}
        value={data.email}
        required={true}
        onChange={(event) => onChange("email", event.target.value)}
        helperText={errors.email}
      />
      <TextField
        margin="dense"
        fullWidth={true}
        error={errors.password ? true : false}
        label={t("signin.password")}
        value={data.password}
        type="password"
        required={true}
        onChange={(event) => onChange("password", event.target.value)}
        helperText={errors.password}
      />
      <TextField
        margin="dense"
        fullWidth={true}
        error={confirmPasswordError ? true : false}
        label={t("signin.confirmPassword")}
        type="password"
        required={true}
        onChange={(event) => onChange("confirmPassword", event.target.value)}
        helperText={
          confirmPasswordError ? t("signin.passwordMismatch") : undefined
        }
      />
      {errors.server && <DialogError error={errors.server} />}

      {!user && (
        <DialogAltButtons
          heading={t("signin.alreadyRegistered")}
          actionName={t("signin.loginAction")}
          onSubmit={onClickLogin}
        />
      )}

      <DialogActions>
        <Button autoFocus onClick={onSubmit} variant="contained">
          {t("signin.signupAction")}
        </Button>
      </DialogActions>
    </div>
  );
};

export default SignupComponent;
