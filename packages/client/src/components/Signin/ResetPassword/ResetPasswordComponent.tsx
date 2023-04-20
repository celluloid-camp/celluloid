import { SigninErrors } from "@celluloid/types";
import TextField from "@mui/material/TextField";
import DialogButtons from "components/DialogButtons";
import SigninError from "components/DialogError";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AnyAction } from "redux";

interface Props {
  login: string;
  errors: SigninErrors;
  onChange(value: string): void;
  onSubmit(): Promise<AnyAction>;
}

const ResetPasswordComponent = ({
  login,
  errors,
  onChange,
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
        value={login}
        error={errors.login ? true : false}
        onChange={(event) => onChange(event.target.value)}
        helperText={errors && errors.login}
      />
      {errors.server && <SigninError error={errors.server} />}
      <DialogButtons
        onSubmit={onSubmit}
        actionName={t("signin.changePasswordAction")}
      />
    </div>
  );
};

export default ResetPasswordComponent;
