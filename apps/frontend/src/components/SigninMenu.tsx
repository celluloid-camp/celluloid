import { IconButton, Menu, MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import * as React from "react";
import { Trans } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { UserAvatar } from "~components/UserAvatar";
import { trpc, UserMe } from "~utils/trpc";

import { Avatar } from "./Avatar";

export const SigninMenu = ({ user }: { user: UserMe }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const utils = trpc.useContext();
  const mutation = trpc.user.logout.useMutation();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await mutation.mutateAsync();
    utils.user.me.invalidate();
    utils.project.list.invalidate();
    handleClose();
    navigate("/", { replace: true });
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    handleClose();
    navigate("/settings");
  };


  const handleOpenAdmin = () => {
    window.open("/admin", "_blank");
    handleClose();
  };

  const handleLogin = () => {
    navigate("/login", { state: { backgroundPath: location.pathname } });
  };

  const handleSignup = () => {
    navigate("/signup", { state: { backgroundPath: location.pathname } });
  };

  return (
    <div>
      {user ? (
        <IconButton onClick={handleClick} data-testid="header-account-menu">
          <Avatar
            sx={{
              background: user.color,
            }}
          >
            {user.initial}
          </Avatar>
        </IconButton>
      ) : (
        <div>
          <Button
            data-testid="header-signup-button"
            onClick={handleSignup}
            sx={{
              textTransform: "uppercase",
              color: "text.primary",
              fontSize: 13,
            }}
          >
            <Trans i18nKey={"menu.signup"} />
          </Button>
          <Button
            data-testid="header-login-button"
            onClick={handleLogin}
            sx={{
              textTransform: "uppercase",
              color: "text.primary",
              fontSize: 13,
            }}
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
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.2))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
      >
        {user && user.role == "Admin" ? (
          <MenuItem onClick={handleOpenAdmin} data-testid="header-admin-button">
            <Trans i18nKey={"menu.admin"} />
          </MenuItem>
        ) : null}
        <MenuItem onClick={handleProfile} data-testid="header-profile-button">
          <Trans i18nKey={"menu.profile"} />
        </MenuItem>
        <MenuItem onClick={handleSettingsClick} data-testid="header-settings-button">
          <Trans i18nKey={"menu.settings"} />
        </MenuItem>
        <MenuItem onClick={handleLogout} data-testid="header-logout-button">
          <Trans i18nKey={"menu.logout"} />
        </MenuItem>
      </Menu>
    </div>
  );
};
