import { SigninErrors, StudentSignupData } from "@celluloid/types";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import { AnyAction } from "redux";

import DialogAltButtons from "~components/DialogAltButtons";
import DialogButtons from "~components/DialogButtons";
import DialogError from "~components/DialogError";
import { Action } from "~types/ActionTypes";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     question: {
//       marginTop: spacing.unit * 2,
//     },
//   });

interface Props {
  data: StudentSignupData;
  errors: SigninErrors;
  confirmPasswordError?: string;
  onChange(name: string, value: string): void;
  onClickLogin(): Action<null>;
  onSubmit(): Promise<AnyAction>;
}

const StudentSignupComponent = ({
  data,
  errors,
  onChange,
  onSubmit,
  onClickLogin,
}: Props) => {
  const { t } = useTranslation();
  return (
    <>
      <TextField
        margin="dense"
        fullWidth={true}
        error={errors.username ? true : false}
        label={t("signin.projectCode")}
        value={data.shareCode}
        required={true}
        onChange={(event) => onChange("shareCode", event.target.value)}
        helperText={errors && errors.shareCode}
      />
      <TextField
        margin="dense"
        fullWidth={true}
        error={errors.email ? true : false}
        label={t("signin.username")}
        value={data.username}
        required={true}
        onChange={(event) => onChange("username", event.target.value)}
        helperText={errors.username}
      />

      <TextField
        margin="dense"
        fullWidth={true}
        error={errors.password ? true : false}
        label={t("signin.lastName")}
        value={data.password}
        required={true}
        onChange={(event) => onChange("password", event.target.value)}
        helperText={errors.password ? errors.password : ""}
      />
      <DialogError error={t("signin.rememberlastName")} />
      {errors.server && <DialogError error={errors.server} />}
      <DialogAltButtons
        heading={t("signin.alreadyRegistered")}
        actionName={t("signin.loginAction")}
        onSubmit={onClickLogin}
      />
      <DialogButtons onSubmit={onSubmit} actionName={t("signin.joinAction")} />
    </>
  );
};

export default StudentSignupComponent;
