import {
  Credentials,
  SigninErrors,
  TeacherConfirmData,
} from "@celluloid/types";
import * as React from "react";
import { connect } from "react-redux";
import { AnyAction, Dispatch } from "redux";

import { doConfirmSignupThunk, doResendCodeThunk } from "~actions/Signin";
import { AppState } from "~types/StateTypes";

import ConfirmSignup from "./ConfirmComponent";

interface Props {
  credentials?: Credentials;
  errors: SigninErrors;
  onClickResend(email: string): Promise<AnyAction>;
  onSubmit(
    data: TeacherConfirmData,
    credentials?: Credentials
  ): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (data: TeacherConfirmData, credentials?: Credentials) =>
      doConfirmSignupThunk(data, credentials)(dispatch),
    onClickResend: (email: string) => doResendCodeThunk(email)(dispatch),
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.errors,
    credentials: state.signin.credentials,
  };
};

class Confirm extends React.Component<Props, TeacherConfirmData> {
  state = {
    login: this.props.credentials ? this.props.credentials.login : "",
    code: "",
  } as TeacherConfirmData;

  render() {
    const onChange = (name: string, value: string) => {
      this.setState((state) => ({
        ...state,
        [name]: value,
      }));
    };

    return (
      <ConfirmSignup
        data={this.state}
        errors={this.props.errors}
        onClickResend={() => this.props.onClickResend(this.state.login)}
        onSubmit={() => this.props.onSubmit(this.state, this.props.credentials)}
        onChange={onChange}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Confirm);
