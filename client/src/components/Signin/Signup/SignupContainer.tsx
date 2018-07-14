import * as React from 'react';
import { AnyAction, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Action } from 'types/Action';
import { doSignupThunk, openLogin } from 'actions/Signin';
import { AppState } from 'types/AppState';
import Signup from './SignupComponent';

import { NewTeacherData, SignupErrors } from '../../../../../common/src/types/Teacher';

interface Props {
  errors?: SignupErrors;
  onClickLogin(): Action<null>;
  onSubmit(data: NewTeacherData): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (data: NewTeacherData): Promise<AnyAction> =>
      doSignupThunk(data)(dispatch),
    onClickLogin: () => dispatch(openLogin())
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.signup.errors
  };
};

interface State extends NewTeacherData {
  confirmPassword: string;
}

export default connect(mapStateToProps, mapDispatchToProps)(
  class extends React.Component<Props, State> {
    state = {
      username: '',
      email: '',
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
        this.state.confirmPassword === this.state.password ?
          undefined : 'Les mots de passe ne correspondent pas';

      return (
        <Signup
          confirmPasswordError={confirmPasswordError}
          onClickLogin={this.props.onClickLogin}
          onSubmit={() => this.props.onSubmit(this.state)}
          onChange={onChange}
        />
      );
    }
  });