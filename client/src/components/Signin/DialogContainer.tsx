import * as React from 'react';

import { DialogState } from './DialogTypes';
import SigninDialog from './DialogComponent';
import Login from './Login';
import Signup from './Signup';
import ConfirmSignup from './ConfirmSignup';
import { AppState } from 'types/AppState';
import { connect } from 'react-redux';

interface Props {
  state: DialogState;
  onCancel: Function;
  loading: boolean;
}

const getComponent = (state: DialogState) => {
  switch (state.kind) {
    case 'Signup':
      return Signup;
    case 'Login':
      return Login;
    case 'ConfirmSignup':
      return ConfirmSignup;
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
        <SigninDialog
          loading={this.props.loading}
          open={true}
          title={this.props.state.title}
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