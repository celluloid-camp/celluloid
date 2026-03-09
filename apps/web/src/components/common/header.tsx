"use client";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  type BoxProps,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type * as React from "react";
import { useState } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { LanguageSwitch } from "./language-switch";
import { LogoSign } from "./logo-sign";
import { LogoWithLabel } from "./logo-with-label";
import { Notifications } from "./notifications";
import { UserMenu } from "./user-menu";

export const Header: React.FC<BoxProps> = () => {
  const t = useTranslations();
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccountAnchor, setMobileAccountAnchor] =
    useState<null | HTMLElement>(null);

  const mobileAccountMenuOpen = Boolean(mobileAccountAnchor);

  const toggleMobileMenu = () => {
    setMobileOpen((open) => !open);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleOpenMobileAccountMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setMobileAccountAnchor(event.currentTarget);
  };

  const handleCloseMobileAccountMenu = () => {
    setMobileAccountAnchor(null);
  };

  const handleMobileLogout = async () => {
    await signOut();
    handleCloseMobileAccountMenu();
    router.replace("/");
  };

  return (
    <>
      <AppBar color="default" position="fixed">
        <Toolbar disableGutters sx={{ px: 2 }}>
          <Box flexGrow={1}>
            <Link href="/">
              <Button sx={{ p: 0 }}>
                <Box sx={{ display: { xs: "block", md: "none" } }}>
                  <LogoSign sx={{ width: 80 }} />
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <LogoWithLabel />
                </Box>
              </Button>
            </Link>
          </Box>

          {/* Desktop navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, mr: 2 }}>
            <Button
              data-testid="header-create-button"
              component={Link}
              href="/create"
              sx={{
                textTransform: "uppercase",
                color: "text.primary",
                fontSize: 13,
              }}
            >
              {t("menu.create")}
            </Button>

            <Button
              data-testid="header-join-button"
              component={Link}
              sx={{
                textTransform: "uppercase",
                color: "text.primary",
                fontSize: 13,
              }}
              href={session ? "/join" : "/student-signup"}
            >
              {t("menu.join")}
            </Button>

            <Button
              sx={{
                textTransform: "uppercase",
                color: "text.primary",
                fontSize: 13,
              }}
              component={Link}
              href="/"
            >
              {t("menu.explore")}
            </Button>

            <Button
              sx={{
                textTransform: "uppercase",
                color: "text.primary",
                fontSize: 13,
              }}
              component={Link}
              href="/about"
            >
              {t("menu.about")}
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                display: { xs: "none", md: "inline-flex" },
                alignItems: "center",
                gap: 1,
              }}
            >
              <Notifications />
              <UserMenu />
              <LanguageSwitch />
            </Box>

            {/* Mobile menu button */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="open navigation menu"
              onClick={toggleMobileMenu}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={closeMobileMenu}
        ModalProps={{ keepMounted: true }}
      >
        <Box
          sx={{ width: 260, mt: 2 }}
          role="presentation"
          onClick={closeMobileMenu}
          onKeyDown={closeMobileMenu}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/create">
                <ListItemText primary={t("menu.create")} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href={session ? "/join" : "/student-signup"}
              >
                <ListItemText primary={t("menu.join")} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} href="/">
                <ListItemText primary={t("menu.explore")} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} href="/about">
                <ListItemText primary={t("menu.about")} />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider sx={{ my: 1 }} />

          <Box
            sx={{
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenMobileAccountMenu}
            >
              {session?.user
                ? (session.user.username ?? t("menu.profile"))
                : t("menu.login")}
            </Button>
            <LanguageSwitch />

            <Menu
              anchorEl={mobileAccountAnchor}
              open={mobileAccountMenuOpen}
              onClose={handleCloseMobileAccountMenu}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
            >
              {session?.user
                ? [
                    <MenuItem
                      key="profile"
                      data-testid="mobile-header-profile-button"
                      component={Link}
                      href="/profile"
                      onClick={handleCloseMobileAccountMenu}
                    >
                      {t("menu.profile")}
                    </MenuItem>,
                    <MenuItem
                      key="settings"
                      data-testid="mobile-header-settings-button"
                      component={Link}
                      href="/settings"
                      onClick={handleCloseMobileAccountMenu}
                    >
                      {t("menu.settings")}
                    </MenuItem>,
                    <Divider key="divider" />,
                    <MenuItem
                      key="logout"
                      onClick={handleMobileLogout}
                      data-testid="mobile-header-logout-button"
                    >
                      {t("menu.logout")}
                    </MenuItem>,
                  ]
                : [
                    <MenuItem
                      key="login"
                      data-testid="mobile-header-login-button"
                      component={Link}
                      href="/login"
                      onClick={handleCloseMobileAccountMenu}
                    >
                      {t("menu.login")}
                    </MenuItem>,
                    <MenuItem
                      key="signup"
                      data-testid="mobile-header-signup-button"
                      component={Link}
                      href="/signup"
                      onClick={handleCloseMobileAccountMenu}
                    >
                      {t("menu.signup")}
                    </MenuItem>,
                  ]}
            </Menu>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
