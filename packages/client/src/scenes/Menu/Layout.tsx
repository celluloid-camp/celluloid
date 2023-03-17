import {
  doLogoutThunk,
  fetchCurrentUserThunk,
} from "actions/Signin/UserActions";
import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { AnyAction, Dispatch } from "redux";

import Menu from "./MenuComponent";

type Props = React.PropsWithChildren & {
  loadUser(): Promise<AnyAction>;
  onClickLogout(): Promise<AnyAction>;
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    loadUser: () => fetchCurrentUserThunk()(dispatch),
    onClickLogout: () => doLogoutThunk()(dispatch),
  };
};

const SharedLayoutInner: React.FC<Props> = ({
  children,
  onClickLogout,
  loadUser,
}) => {
  const { i18n } = useTranslation();
  const [menuAnchor, setMenuAnchor] = useState<any>(null);

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onOpenLangMenu = (element: EventTarget) => {
    setMenuAnchor(element);
  };

  const onCloseLangMenu = () => {
    setMenuAnchor(undefined);
  };

  const handleLangChange = (lang: string) => {
    i18n.changeLanguage(lang, () => onCloseLangMenu());
  };

  return (
    <Menu
      onOpenLangMenu={onOpenLangMenu}
      onCloseLangMenu={onCloseLangMenu}
      onLangChange={handleLangChange}
      onClickLogout={onClickLogout}
      menuAnchor={menuAnchor}
    >
      {children}
    </Menu>
  );
};

export const SharedLayout = connect(
  null,
  mapDispatchToProps
)(SharedLayoutInner);
