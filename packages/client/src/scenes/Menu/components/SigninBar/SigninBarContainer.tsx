import { UserRecord } from '@celluloid/types';
import * as React from 'react';

import SigninBarComponent from './SigninBarComponent';

interface Props {
  user?: UserRecord;
  onClickLogin(): void;
  onClickSignup(): void;
  onClickLogout(): void;
}

interface State {
  menuAnchor?: EventTarget;
}

export default class extends React.Component<Props, State> {
  state = {
    menuAnchor: undefined
  };

  render() {
    const {
      user,
      onClickLogin,
      onClickLogout,
      onClickSignup
    } = this.props;

    const { menuAnchor } = this.state;

    const onOpenUserMenu = (element: EventTarget) => {
      this.setState({ menuAnchor: element });
    };

    const onCloseUserMenu = () => {
      this.setState({ menuAnchor: undefined });
    };

    return (
      <SigninBarComponent
        user={user}
        onClickLogin={onClickLogin}
        onClickLogout={() => { onCloseUserMenu(); onClickLogout(); }}
        onClickSignup={onClickSignup}
        onOpenUserMenu={onOpenUserMenu}
        onCloseUserMenu={onCloseUserMenu}
        menuAnchor={menuAnchor}
      />
    );
  }
}