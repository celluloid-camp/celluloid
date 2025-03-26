import { IconButton, Menu, MenuItem, Skeleton } from "@mui/material";
import Button from "@mui/material/Button";
import * as React from "react";

import { Avatar } from "./avatar";
import { signOut, useSession, type User } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export const UserMenu = () => {
  const { data: session, isPending } = useSession();

  const navigate = useRouter();
  const t = useTranslations();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut();
    handleClose();
  };

  const handleProfile = () => {
    handleClose();
    navigate.push("/profile");
  };

  const handleSettingsClick = () => {
    handleClose();
    navigate.push("/settings");
  };

  const handleOpenAdmin = () => {
    window.open("/admin", "_blank");
    handleClose();
  };

  const handleLogin = () => {
    navigate.push("/login");
  };

  const handleSignup = () => {
    navigate.push("/signup");
  };

  if (isPending) {
    return <Skeleton variant="circular" width={40} height={40} />;
  }

  return (
    <div>
      {session?.user ? (
        <IconButton onClick={handleClick} data-testid="header-account-menu">
          <Avatar
            sx={{
              background: session.user.color,
              borderWidth: 2,
              borderColor: session.user.color,
              borderStyle: "solid",
            }}
            src={session.user.image ?? undefined}
          >
            {session.user.email?.charAt(0)}
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
            {t("menu.signup")}
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
            {t("menu.login")}
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
        {session?.user?.role === "admin" ? (
          <MenuItem onClick={handleOpenAdmin} data-testid="header-admin-button">
            {t("menu.admin")}
          </MenuItem>
        ) : null}
        <MenuItem onClick={handleProfile} data-testid="header-profile-button">
          {t("menu.profile")}
        </MenuItem>
        <MenuItem
          onClick={handleSettingsClick}
          data-testid="header-settings-button"
        >
          {t("menu.settings")}
        </MenuItem>
        <MenuItem onClick={handleLogout} data-testid="header-logout-button">
          {t("menu.logout")}
        </MenuItem>
      </Menu>
    </div>
  );
};
