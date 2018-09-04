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

    const openMenu = (element: EventTarget) => {
      this.setState({ menuAnchor: element });
    };

    const closeMenu = () => {
      this.setState({ menuAnchor: undefined });
    };

    return (
      <SigninBarComponent
        user={user}
        onClickLogin={onClickLogin}
        onClickLogout={() => { closeMenu(); onClickLogout(); }}
        onClickSignup={onClickSignup}
        onClickAvatar={openMenu}
        onCloseMenu={closeMenu}
        menuAnchor={menuAnchor}
      />
    );
  }
}