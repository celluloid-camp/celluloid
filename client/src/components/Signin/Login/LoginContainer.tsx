import * as React from 'react';
import { AnyAction, Dispatch } from 'redux';
import { connect } from 'react-redux';

import Login from './LoginComponent';
import { openSignup, doLoginThunk } from 'actions/Signin';
import { Action } from 'types/Action';
import { AppState } from 'types/AppState';

import { TeacherCredentials, LoginErrors } from '../../../../../common/src/types/Teacher';

interface Props {
  errors?: LoginErrors;
  onClickSignup(): Action<null>;
  onSubmit(credentials: TeacherCredentials): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (credentials: TeacherCredentials) =>
      doLoginThunk(credentials)(dispatch),
    onClickSignup: () => dispatch(openSignup())
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.login.errors
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
          onClickSignup={this.props.onClickSignup}
          onSubmit={() => this.props.onSubmit(this.state)}
          onChange={onChange}
        />
      );
    }
  });