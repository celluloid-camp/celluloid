import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Outlet } from "react-router-dom";
import { AnyAction, Dispatch } from "redux";

import { fetchCurrentUserThunk } from "~actions/Signin/UserActions";

import { AppBarMenu } from "./AppBarMenu";

type Props = React.PropsWithChildren & {
  loadUser(): Promise<AnyAction>;
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    loadUser: () => fetchCurrentUserThunk()(dispatch),
  };
};

const SharedLayoutInner: React.FC<Props> = ({ loadUser }) => {
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <AppBarMenu>
        <Outlet />
      </AppBarMenu>
    </>
  );
};

export const SharedLayout = connect(
  null,
  mapDispatchToProps
)(SharedLayoutInner);
