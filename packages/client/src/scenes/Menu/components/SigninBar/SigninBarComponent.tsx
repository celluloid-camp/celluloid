import { UserRecord } from "@celluloid/types";
import {
  ClickAwayListener,
  Grow as GrowMUI,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { GrowProps } from "@material-ui/core/Grow";
import UserAvatar from "components/UserAvatar";
import * as React from "react";
import { useTranslation } from "react-i18next";

const Grow: React.FC<React.PropsWithChildren & GrowProps> = (props) => (
  <GrowMUI {...props} />
);

interface Props {
  user?: UserRecord;
  menuAnchor?: HTMLElement;
  onClickLogin(): void;
  onClickSignup(): void;
  onClickLogout(): void;
  onOpenUserMenu(element: EventTarget): void;
  onCloseUserMenu(): void;
}

const SigninBarComponent = ({
  user,
  menuAnchor,
  onClickLogin,
  onClickSignup,
  onClickLogout,
  onOpenUserMenu,
  onCloseUserMenu,
}: Props) => {
  const { t } = useTranslation();
  return user ? (
    <div>
      <IconButton onClick={(event) => onOpenUserMenu(event.target)}>
        <UserAvatar user={user} noMargin={true} />
      </IconButton>
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
              <ClickAwayListener onClickAway={onCloseUserMenu}>
                <MenuList>
                  <MenuItem onClick={onClickLogout}>Déconnexion</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  ) : (
    <div>
      <Button onClick={onClickSignup}>{t("menu.signup")}</Button>
      <Button onClick={onClickLogin} color="primary">
        {t("menu.login")}
      </Button>
    </div>
  );
};

export default SigninBarComponent;
