import * as React from 'react';
import { AnyAction, Dispatch } from 'redux';
import { connect } from 'react-redux';

import Login from './LoginComponent';
import { openSignup, doLoginThunk, openResetPassword } from 'actions/Signin';
import { Action } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';

import { TeacherCredentials, SigninErrors } from '@celluloid/commons';

interface Props {
  errors: SigninErrors;
  onClickSignup(): Action<null>;
  onClickResetPassword(): Action<null>;
  onSubmit(credentials: TeacherCredentials): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (credentials: TeacherCredentials) =>
      doLoginThunk(credentials)(dispatch),
    onClickSignup: () => dispatch(openSignup()),
    onClickResetPassword: () => dispatch(openResetPassword())
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.errors
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  class extends React.Component<Props, TeacherCredentials> {
    state = {
      email: '',
      password: '',
    } as TeacherCredentials;

    render() {
      const onChange = (name: string, value: string) => {
        this.setState(state => ({
          ...state,
          [name]: value
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
  });