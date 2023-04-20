import {
  SigninErrors,
  TeacherConfirmResetPasswordData,
} from "@celluloid/types";
import { TextField } from "@mui/material";
import DialogButtons from "components/DialogButtons";
import DialogError from "components/DialogError";
import React from "react";
import { useTranslation } from "react-i18next";
import { AnyAction } from "redux";

interface Props {
  data: TeacherConfirmResetPasswordData;
  errors: SigninErrors;
  confirmPasswordError: boolean;
  onChange(name: string, value: string): void;
  onSubmit(): Promise<AnyAction>;
}

// eslint-disable-next-line import/no-anonymous-default-export
const ConfirmComponent = ({
  data,
  errors,
  confirmPasswordError,
  onChange,
  onSubmit,
}: Props) => {
  const { t } = useTranslation();
  return (
    <div>
      <TextField
        fullWidth={true}
        margin="dense"
        label={t("signin.login")}
        required={true}
        value={data.login}
        error={errors.email ? true : false}
        onChange={(event) => onChange("login", event.target.value)}
        helperText={errors && errors.login}
      />
      <TextField
        fullWidth={true}
        margin="dense"
        label={t("signin.code")}
        required={true}
        value={data.code}
        error={errors.code ? true : false}
        onChange={(event) => onChange("code", event.target.value)}
        helperText={errors.code ? errors.code : t("signin.codeHelper")}
      />
      <TextField
        fullWidth={true}
        margin="dense"
        label={t("signin.password")}
        required={true}
        value={data.password}
        type="password"
        error={errors.password ? true : false}
        onChange={(event) => onChange("password", event.target.value)}
        helperText={errors && errors.password}
      />
      <TextField
        fullWidth={true}
        margin="dense"
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
      <DialogButtons onSubmit={onSubmit} actionName={t("signin.resetAction")} />
    </div>
  );
};

export default ConfirmComponent;
