import { SigninErrors, TeacherConfirmResetPasswordData } from '@celluloid/types';
import { doConfirmResetPasswordThunk } from 'actions/Signin';
import * as React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { Action } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';

import ConfirmResetPassword from './ConfirmResetPasswordComponent';

interface Props {
  errors: SigninErrors;
  onClickSignup?(): Action<null>;
  onSubmit(data: TeacherConfirmResetPasswordData): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (data: TeacherConfirmResetPasswordData) =>
      doConfirmResetPasswordThunk(data)(dispatch)
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.errors
  };
};

interface State extends TeacherConfirmResetPasswordData {
  confirmPassword: string;
}

class Confirm extends React.Component<Props, State> {
  state = {
    login: '',
    code: '',
    password: '',
    confirmPassword: ''
  } as State;

  render() {
    const onChange = (name: string, value: string) => {
      this.setState(state => ({
        ...state,
        [name]: value
      }));
    };

    const confirmPasswordError =
      this.state.confirmPassword === this.state.password
        ? false
        : true;

    return (
      <ConfirmResetPassword
        data={this.state}
        errors={this.props.errors}
        confirmPasswordError={confirmPasswordError}
        onSubmit={() => this.props.onSubmit(this.state)}
        onChange={onChange}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Confirm);
