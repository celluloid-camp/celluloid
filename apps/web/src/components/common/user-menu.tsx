import { IconButton, Menu, MenuItem, Skeleton } from "@mui/material";
import Button from "@mui/material/Button";
import * as React from "react";

import { type User, signOut, useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "./avatar";

export const UserMenu = () => {
  const router = useRouter();

  const { data: session, isPending } = useSession();
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
    router.replace("/");
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
              width: 40,
              height: 40,
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
            component={Link}
            href="/signup"
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
            component={Link}
            href="/login"
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
        onClick={handleClose}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              minWidth: 120,
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
          <MenuItem
            data-testid="header-admin-button"
            component={Link}
            href="/admin"
          >
            {t("menu.admin")}
          </MenuItem>
        ) : null}
        <MenuItem
          data-testid="header-profile-button"
          component={Link}
          href="/profile"
        >
          {t("menu.profile")}
        </MenuItem>
        <MenuItem
          data-testid="header-settings-button"
          component={Link}
          href="/settings"
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
