import * as React from "react";
import { connect } from "react-redux";

import { AppState } from "~types/StateTypes";

import ConfirmResetPassword from "./ConfirmResetPassword";
import ConfirmSignup from "./ConfirmSignup";
import Dialog from "./DialogComponent";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import { SigninState } from "./SigninTypes";
import Signup from "./Signup";
import StudentSignup from "./StudentSignup";

interface Props {
  state: SigninState;
  loading: boolean;
  onCancel(): void;
}

const getComponent = (state: SigninState) => {
  switch (state.kind) {
    case "Signup":
      return Signup;
    case "StudentSignup":
      return StudentSignup;
    case "Login":
      return Login;
    case "ConfirmSignup":
      return ConfirmSignup;
    case "ResetPassword":
      return ResetPassword;
    case "ConfirmResetPassword":
      return ConfirmResetPassword;
    default:
      return undefined;
  }
};

const mapStateToProps = (state: AppState) => ({
  loading: state.signin.loading,
});

const DialogContainer: React.FC<Props> = ({ state, loading, onCancel }) => {
  if (state.kind !== "None") {
    return (
      <Dialog
        loading={loading}
        open={true}
        title={state.name}
        onCancel={onCancel}
        Content={getComponent(state)}
      />
    );
  } else {
    return <div />;
  }
};

export default connect(mapStateToProps)(DialogContainer);
