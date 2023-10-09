import { AppBar, Box, Button, styled, Toolbar } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { connect, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Dispatch } from "redux";

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
import { EmptyAction } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";
import { trpc } from "~utils/trpc";

import { LanguageMenu } from "./LanguageMenu";

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

type Props = React.PropsWithChildren & {
  signinDialog: SigninState;
  onClickLogin(): EmptyAction;
  onClickSignup(): EmptyAction;
  onCloseSignin(): EmptyAction;
};

const mapStateToProps = (state: AppState) => {
  return {
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
  onClickLogin,
  onClickSignup,
  onCloseSignin,
  signinDialog,
  children,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const meQuery = trpc.user.me.useQuery();
  const logoutMutation = trpc.user.logout.useMutation();

  const dispatch = useDispatch();

  const handleCreate = () => {
    if (!meQuery.error) {
      navigate(`/create`);
    } else {
      dispatch(openStudentSignup());
    }
  };

  const handleJoin = () => {
    dispatch(openStudentSignup());
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
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
            user={meQuery.data}
            onClickLogin={onClickLogin}
            onClickSignup={onClickSignup}
            onClickLogout={handleLogout}
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
