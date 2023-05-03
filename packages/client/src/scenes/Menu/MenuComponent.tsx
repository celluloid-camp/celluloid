import { UserRecord } from "@celluloid/types";
import {
  AppBar,
  Box,
  Button,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Toolbar,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { AnyAction, Dispatch } from "redux";

import { closeSignin, openLogin, openSignup } from "~actions/Signin";
import { getButtonLink } from "~components/ButtonLink";
import { Footer } from "~components/Footer";
import { LogoWithLabel } from "~components/LogoWithLabel";
import SigninDialog, { SigninState } from "~components/Signin";
import { EmptyAction } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";

import SigninBar from "./components/SigninBar";

type Props = React.PropsWithChildren & {
  user?: UserRecord;
  signinDialog: SigninState;
  menuAnchor?: HTMLElement;
  onOpenLangMenu(element: EventTarget): void;
  onCloseLangMenu(): void;
  onLangChange(lang: string): void;
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

const MenuComponent: React.FC<Props> = ({
  user,
  menuAnchor,
  onOpenLangMenu,
  onCloseLangMenu,
  onLangChange,
  onClickLogin,
  onClickSignup,
  onClickLogout,
  onCloseSignin,
  signinDialog,
  children,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <Box sx={{ height: "100%", padding: 0, margin: 0 }}>
      <AppBar color="default">
        <Toolbar>
          <Box flexGrow={1}>
            <Button component={getButtonLink("/")}>
              <LogoWithLabel />
            </Button>
          </Box>

          <Button
            sx={{ textTransform: "uppercase", color: "text.primary" }}
            component={getButtonLink("/")}
          >
            {t("menu.create", "Créer")}
          </Button>

          <Button
            sx={{ textTransform: "uppercase", color: "text.primary" }}
            component={getButtonLink("/")}
          >
            {t("menu.join", "Rejoindre")}
          </Button>

          <Button
            sx={{ textTransform: "uppercase", color: "text.primary" }}
            component={getButtonLink("/")}
          >
            {t("menu.explore", "Explorer")}
          </Button>

          <Button
            sx={{ textTransform: "uppercase", color: "text.primary" }}
            component={getButtonLink("/About")}
          >
            {t("menu.about")}
          </Button>
          <SigninBar
            user={user}
            onClickLogin={onClickLogin}
            onClickSignup={onClickSignup}
            onClickLogout={onClickLogout}
          />

          <Button
            onClick={(event) => onOpenLangMenu(event.target)}
            sx={{ color: "text.primary" }}
          >
            {i18n.language.split("_")[0].toUpperCase()}
          </Button>
          <Popper
            open={Boolean(menuAnchor)}
            anchorEl={menuAnchor}
            transition={true}
            disablePortal={true}
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom" ? "center top" : "center bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={onCloseLangMenu}>
                    <MenuList>
                      <MenuItem onClick={() => onLangChange("en_US")}>
                        {`English`}
                      </MenuItem>
                      <MenuItem onClick={() => onLangChange("fr_FR")}>
                        {`Français`}
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </Toolbar>
      </AppBar>
      <SigninDialog onCancel={onCloseSignin} state={signinDialog} />
      <Box sx={{ paddingTop: 8 }}>{children}</Box>
      <Footer />
    </Box>
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(MenuComponent);
