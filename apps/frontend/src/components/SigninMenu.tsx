import { IconButton, Menu, MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import * as React from "react";
import { Trans } from "react-i18next";
import { useNavigate } from "react-router";

import { UserAvatar } from "~components/UserAvatar";
import { UserMe } from "~utils/trpc";

interface Props {
  user?: UserMe;
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
  const navigate = useNavigate();
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

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleOpenAdmin = () => {
    window.open("/admin", "_blank");
    handleClose();
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
            sx={{
              textTransform: "uppercase",
              color: "text.primary",
              fontSize: 13,
            }}
          >
            <Trans i18nKey={"menu.signup"} />
          </Button>
          <Button
            onClick={onClickLogin}
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
      {/* <Link to={`login`} state={{ backgroundLocation: location }}>
            <Button>test {location.pathname}</Button>
          </Link>
          <Link to={`signup`} state={{ backgroundLocation: location }}>
            <Button>test {location.pathname}</Button>
          </Link> */}
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
          <MenuItem onClick={handleOpenAdmin}>
            <Trans i18nKey={"menu.admin"} />
          </MenuItem>
        ) : null}
        <MenuItem onClick={handleProfile}>
          <Trans i18nKey={"menu.profile"} />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Trans i18nKey={"menu.logout"} />
        </MenuItem>
      </Menu>
    </div>
  );
};
