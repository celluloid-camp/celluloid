import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Outlet } from "react-router-dom";
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

const SharedLayoutInner: React.FC<Props> = ({ onClickLogout, loadUser }) => {
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <AppBarMenu onClickLogout={onClickLogout}>
        <Outlet />
      </AppBarMenu>
    </>
  );
};

export const SharedLayout = connect(
  null,
  mapDispatchToProps
)(SharedLayoutInner);
