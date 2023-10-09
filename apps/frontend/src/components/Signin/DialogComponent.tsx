import { styled } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

import DialogHeader from "../DialogHeader";
import ConfirmResetPassword from "./ConfirmResetPassword";
import ConfirmSignup from "./ConfirmSignup";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import Signup from "./Signup";
import StudentSignup from "./StudentSignup";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(0),
  },
}));
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

const DialogComponent: React.FC<Props> = (props) => {
  const { loading = false, title, open, onCancel, Content } = props;

  return (
    <BootstrapDialog
      scroll="body"
      open={open}
      maxWidth="xs"
      fullWidth={true}
      onClose={() => onCancel()}
    >
      <DialogHeader loading={loading} onClose={onCancel}>
        {title}
      </DialogHeader>
      <DialogContent sx={{ margin: 1, padding: 2 }}>
        {Content && <Content />}
      </DialogContent>
    </BootstrapDialog>
  );
};

export default DialogComponent;
