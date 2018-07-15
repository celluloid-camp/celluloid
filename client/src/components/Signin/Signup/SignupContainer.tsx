import * as React from 'react';
import { AnyAction, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Action } from 'types/Action';
import { doSignupThunk, openLogin } from 'actions/Signin';
import { AppState } from 'types/AppState';
import Signup from './SignupComponent';

import { TeacherSignupData, SigninErrors } from '../../../../../common/src/types/TeacherTypes';

interface Props {
  errors: SigninErrors;
  onClickLogin(): Action<null>;
  onSubmit(data: TeacherSignupData): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (data: TeacherSignupData): Promise<AnyAction> =>
      doSignupThunk(data)(dispatch),
    onClickLogin: () => dispatch(openLogin())
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.errors
  };
};

interface State extends TeacherSignupData {
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
          data={this.state}
          errors={this.props.errors}
          confirmPasswordError={confirmPasswordError}
          onClickLogin={this.props.onClickLogin}
          onSubmit={() => this.props.onSubmit(this.state)}
          onChange={onChange}
        />
      );
    }
  });