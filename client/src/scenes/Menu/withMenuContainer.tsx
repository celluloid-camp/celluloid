import * as React from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'react-redux';

import { RouteComponentProps, withRouter } from 'react-router-dom';

import { WithLogin } from 'types/Teacher';

import Menu from './MenuComponent';
import { fetchCurrentUserThunk, doLogoutThunk } from 'actions/Signin/UserActions';

interface Props extends RouteComponentProps<{}> {
  onMount(): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onMount: () => fetchCurrentUserThunk()(dispatch),
    onClickLogout: () => doLogoutThunk()(dispatch)
  };
};

export const withMenuContainer = <P extends WithLogin>(Content: React.ComponentType<P>) => (
  withRouter(
    connect(null, mapDispatchToProps)(
      class extends React.Component<Props> {
        componentWillMount() {
          this.props.onMount();
        }

        render() {
          return (
            <Menu
              Content={Content}
              onClickLogout={this.props.onMount}
              {...this.props}
            />
          );
        }
      }
    )
  )
);