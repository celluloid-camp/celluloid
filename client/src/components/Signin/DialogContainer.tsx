import * as React from 'react';

import { DialogState } from './DialogTypes';
import SigninDialog from './DialogComponent';
import Login from './Login';
import Signup from './Signup';

interface Props {
  state: DialogState;
  onCancel: Function;
}

const getComponent = (state: DialogState) => {
  switch (state.kind) {
    case 'Signup':
      return Signup;
    case 'Login':
      return Login;
    default:
      return undefined;
  }
};

export default class extends React.Component<Props> {
  render() {
    if (this.props.state.kind !== 'None') {
      return (
        <SigninDialog
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
}