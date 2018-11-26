import { doLogoutThunk, fetchCurrentUserThunk } from 'actions/Signin/UserActions';
import * as React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';

import Menu from './MenuComponent';
import { withI18n, WithI18n } from 'react-i18next';

interface Props {
  onMount(): Promise<AnyAction>;
  onClickLogout(): Promise<AnyAction>;
}

interface State {
  menuAnchor?: EventTarget;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onMount: () => fetchCurrentUserThunk()(dispatch),
    onClickLogout: () => doLogoutThunk()(dispatch)
  };
};

export const withMenuContainer = (Content: React.ComponentType) => (
  connect(null, mapDispatchToProps)(withI18n()(

    class extends React.Component<Props & WithI18n, State> {
      state = {
        menuAnchor: undefined,
      };

      componentDidMount() {
        this.props.onMount();
      }

      render() {
        const onOpenLangMenu = (element: EventTarget) => {
          this.setState({ menuAnchor: element });
        };

        const onCloseLangMenu = () => {
          this.setState({ menuAnchor: undefined });
        };

        const onLangChange = (lang: string) => {
          this.props.i18n.changeLanguage(lang, () => onCloseLangMenu());
        };

        return (
          <Menu
            onOpenLangMenu={onOpenLangMenu}
            onCloseLangMenu={onCloseLangMenu}
            onLangChange={onLangChange}
            Content={Content}
            onClickLogout={this.props.onClickLogout}
            menuAnchor={this.state.menuAnchor}
          />
        );
      }
    }
  )
  ));