import { doLogoutThunk, fetchCurrentUserThunk } from 'actions/Signin/UserActions';
import * as React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';

import Menu from './MenuComponent';

interface Props {
  onMount(): Promise<AnyAction>;
  onClickLogout(): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onMount: () => fetchCurrentUserThunk()(dispatch),
    onClickLogout: () => doLogoutThunk()(dispatch)
  };
};

export const withMenuContainer = (Content: React.ComponentType) => (
  connect(null, mapDispatchToProps)(
    class extends React.Component<Props> {
      componentDidMount() {
        this.props.onMount();
      }

      render() {
        return (
          <Menu
            Content={Content}
            onClickLogout={this.props.onClickLogout}
          />
        );
      }
    }
  )
);