import { Credentials, SigninErrors } from "@celluloid/types";
import * as React from "react";
import { connect } from "react-redux";
import { AnyAction, Dispatch } from "redux";

import { doLoginThunk, openResetPassword, openSignup } from "~actions/Signin";
import { Action } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";

import Login from "./LoginComponent";

interface Props {
  errors: SigninErrors;
  onClickSignup(): Action<null>;
  onClickResetPassword(): Action<null>;
  onSubmit(credentials: Credentials): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (credentials: Credentials) => doLoginThunk(credentials)(dispatch),
    onClickSignup: () => dispatch(openSignup()),
    onClickResetPassword: () => dispatch(openResetPassword()),
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.errors,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  class extends React.Component<Props, Credentials> {
    state = {
      login: "",
      password: "",
    } as Credentials;

    render() {
      const onChange = (name: string, value: string) => {
        this.setState((state) => ({
          ...state,
          [name]: value,
        }));
      };

      return (
        <Login
          credentials={this.state}
          errors={this.props.errors}
          onClickResetPassword={this.props.onClickResetPassword}
          onClickSignup={this.props.onClickSignup}
          onSubmit={() => this.props.onSubmit(this.state)}
          onChange={onChange}
        />
      );
    }
  }
);
