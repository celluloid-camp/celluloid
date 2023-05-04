import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { AnyAction, Dispatch } from "redux";

import {
  doLogoutThunk,
  fetchCurrentUserThunk,
} from "~actions/Signin/UserActions";

import { AppBarMenu } from "./AppBarMenu";

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
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AppBarMenu onClickLogout={onClickLogout}>{children}</AppBarMenu>;
};

export const SharedLayout = connect(
  null,
  mapDispatchToProps
)(SharedLayoutInner);
