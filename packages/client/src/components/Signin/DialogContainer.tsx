import * as React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'types/StateTypes';

import { SigninState } from './SigninTypes';
import Dialog from './DialogComponent';
import Login from './Login';
import Signup from './Signup';
import ConfirmSignup from './ConfirmSignup';
import ResetPassword from './ResetPassword';
import ConfirmResetPassword from './ConfirmResetPassword';
import StudentSignup from './StudentSignup';

interface Props {
  state: SigninState;
  onCancel: Function;
  loading: boolean;
}

const getComponent = (state: SigninState) => {
  switch (state.kind) {
    case 'Signup':
      return Signup;
    case 'StudentSignup':
      return StudentSignup;
    case 'Login':
      return Login;
    case 'ConfirmSignup':
      return ConfirmSignup;
    case 'ResetPassword':
      return ResetPassword;
    case 'ConfirmResetPassword':
      return ConfirmResetPassword;
    default:
      return undefined;
  }
};

const mapStateToProps = (state: AppState) => ({
  loading: state.signin.loading
});

export default connect(mapStateToProps)(class extends React.Component<Props> {
  render() {
    if (this.props.state.kind !== 'None') {
      return (
        <Dialog
          loading={this.props.loading}
          open={true}
          title={this.props.state.name}
          onCancel={this.props.onCancel}
          Content={getComponent(this.props.state)}
        />
      );
    } else {
      return (
        <div />
      );
    }
  }
});