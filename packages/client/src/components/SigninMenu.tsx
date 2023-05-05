import { UserRecord } from "@celluloid/types";
import { IconButton, Menu, MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import * as React from "react";
import { Trans } from "react-i18next";

import { UserAvatar } from "~components/UserAvatar";

interface Props {
  user?: UserRecord;
  onClickLogin(): void;
  onClickSignup(): void;
  onClickLogout(): void;
}

export const SigninMenu = ({
  user,
  onClickLogin,
  onClickSignup,
  onClickLogout,
}: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onClickLogout();
  };
  return (
    <div>
      {user ? (
        <IconButton onClick={handleClick}>
          <UserAvatar username={user.username} userId={user.id} />
        </IconButton>
      ) : (
        <div>
          <Button
            onClick={onClickSignup}
            sx={{ textTransform: "uppercase", color: "text.primary" }}
          >
            <Trans i18nKey={"menu.signup"} />
          </Button>
          <Button
            onClick={onClickLogin}
            sx={{ textTransform: "uppercase", color: "text.primary" }}
          >
            <Trans i18nKey={"menu.login"} />
          </Button>
        </div>
      )}
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {user.role == "admin" ? (
          <MenuItem href="/admin">
            <Trans i18nKey={"menu.admin"} />
          </MenuItem>
        ) : null}
        <MenuItem onClick={handleLogout}>
          <Trans i18nKey={"menu.logout"} />
        </MenuItem>
      </Menu>
    </div>
  );
};
