import * as React from 'react';
import { AnyAction, Dispatch } from 'redux';
import { connect } from 'react-redux';

import ResetPassword from './ResetPasswordComponent';
import { AppState } from 'types/StateTypes';

import { SigninErrors } from '@celluloid/types';
import { doResetPasswordThunk } from 'actions/Signin/ResetPasswordActions';

interface Props {
  errors: SigninErrors;
  onSubmit(email: string): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (email: string) => doResetPasswordThunk(email)(dispatch)
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.errors
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  class extends React.Component<Props, { login: string }> {
    state = { login: '' };

    render() {
      const onChange = (value: string) => {
        this.setState({
          login: value
        });
      };

      return (
        <ResetPassword
          login={this.state.login}
          errors={this.props.errors}
          onSubmit={() => this.props.onSubmit(this.state.login)}
          onChange={onChange}
        />
      );
    }
  }
);
