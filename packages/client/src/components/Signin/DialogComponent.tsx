import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import * as React from "react";

import DialogHeader from "../DialogHeader";
import ConfirmResetPassword from "./ConfirmResetPassword";
import ConfirmSignup from "./ConfirmSignup";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import Signup from "./Signup";
import StudentSignup from "./StudentSignup";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     content: {
//       padding: spacing.unit * 2,
//       margin: spacing.unit,
//     },
//   });

interface Props {
  loading: boolean;
  title: string;
  open: boolean;
  Content?:
    | typeof Login
    | typeof Signup
    | typeof StudentSignup
    | typeof ConfirmSignup
    | typeof ResetPassword
    | typeof ConfirmResetPassword;
  onCancel(): void;
}

export default (props: Props) => {
  const { loading, title, open, onCancel, Content } = props;

  return (
    <Dialog
      scroll="body"
      open={open}
      maxWidth="xs"
      fullWidth={true}
      onClose={() => onCancel()}
    >
      <DialogHeader title={title} loading={loading} onClose={onCancel} />
      <DialogContent sx={{ margin: 1, padding: 2 }}>
        {Content && <Content />}
      </DialogContent>
    </Dialog>
  );
};
