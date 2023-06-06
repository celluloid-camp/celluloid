import { UserRecord } from "@celluloid/types";
import { AppBar, Box, Button, styled, Toolbar } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { connect, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { AnyAction, Dispatch } from "redux";

import {
  closeSignin,
  openLogin,
  openSignup,
  openStudentSignup,
} from "~actions/Signin";
import { getButtonLink } from "~components/ButtonLink";
import { Footer } from "~components/Footer";
import { LogoWithLabel } from "~components/LogoWithLabel";
import SigninDialog, { SigninState } from "~components/Signin";
import { SigninMenu } from "~components/SigninMenu";
import { useMe } from "~hooks/use-user";
import { EmptyAction } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";

import { LanguageMenu } from "./LanguageMenu";

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

type Props = React.PropsWithChildren & {
  user?: UserRecord;
  signinDialog: SigninState;
  onClickLogin(): EmptyAction;
  onClickSignup(): EmptyAction;
  onCloseSignin(): EmptyAction;
  onClickLogout(): Promise<AnyAction>;
};

const mapStateToProps = (state: AppState) => {
  return {
    user: state.user,
    signinDialog: state.signin.dialog,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onClickLogin: () => dispatch(openLogin()),
    onClickSignup: () => dispatch(openSignup()),
    onCloseSignin: () => dispatch(closeSignin()),
  };
};

export const AppBarMenuWrapper: React.FC<Props> = ({
  user,
  onClickLogin,
  onClickSignup,
  onClickLogout,
  onCloseSignin,
  signinDialog,
  children,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data } = useMe();
  const dispatch = useDispatch();

  const handleCreate = () => {
    if (!data.error) {
      navigate(`/create`);
    } else {
      dispatch(openStudentSignup());
    }
  };

  const handleJoin = () => {
    dispatch(openStudentSignup());
  };

  return (
    <Box sx={{ height: "100vh" }}>
      <AppBar color="default" position="fixed">
        <Toolbar disableGutters>
          <Box flexGrow={1}>
            <Button component={getButtonLink("/")}>
              <LogoWithLabel />
            </Button>
          </Box>

          <Button
            sx={{ textTransform: "uppercase", color: "text.primary" }}
            onClick={() => handleCreate()}
          >
            {t("menu.create", "Créer")}
          </Button>

          <Button
            sx={{ textTransform: "uppercase", color: "text.primary" }}
            onClick={() => handleJoin()}
          >
            {t("menu.join", "Rejoindre")}
          </Button>

          <Button
            sx={{ textTransform: "uppercase", color: "text.primary" }}
            href="/"
          >
            {t("menu.explore", "Explorer")}
          </Button>

          <Button
            sx={{ textTransform: "uppercase", color: "text.primary" }}
            href="/about"
          >
            {t("menu.about")}
          </Button>
          <SigninMenu
            user={user}
            onClickLogin={onClickLogin}
            onClickSignup={onClickSignup}
            onClickLogout={onClickLogout}
          />
          <LanguageMenu />
        </Toolbar>
      </AppBar>
      <SigninDialog onCancel={onCloseSignin} state={signinDialog} />
      <Offset />
      {children}
      <Footer />
    </Box>
  );
};
export const AppBarMenu = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBarMenuWrapper);
