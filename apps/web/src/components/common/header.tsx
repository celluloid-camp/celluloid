"use client";
import {
  AppBar,
  Box,
  type BoxProps,
  Button,
  styled,
  Toolbar,
} from "@mui/material";
import type * as React from "react";
import { useTranslations } from "next-intl";
import { LogoWithLabel } from "./logo-with-label";

import { LanguageSwitch } from "./language-switch";
import { useSession } from "@/lib/auth-client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserMenu } from "./user-menu";
const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

export const Header: React.FC<BoxProps> = ({ children }) => {
  const t = useTranslations();
  const navigate = useRouter();
  const { data: session } = useSession();

  const handleCreate = () => {
    if (session) {
      navigate.push("/create");
    } else {
      navigate.push("/signup");
    }
  };

  const handleJoin = () => {
    if (!session) {
      navigate.push("/signup-student");
    } else {
      navigate.push("/join");
    }
  };

  return (
    <AppBar color="default" position="fixed">
      <Toolbar disableGutters>
        <Box flexGrow={1}>
          <Link href="/">
            <Button>
              <LogoWithLabel />
            </Button>
          </Link>
        </Box>

        <Button
          data-testid="header-create-button"
          sx={{
            textTransform: "uppercase",
            color: "text.primary",
            fontSize: 13,
          }}
          onClick={() => handleCreate()}
        >
          {t("menu.create")}
        </Button>

        <Button
          data-testid="header-join-button"
          sx={{
            textTransform: "uppercase",
            color: "text.primary",
            fontSize: 13,
          }}
          onClick={() => handleJoin()}
        >
          {t("menu.join")}
        </Button>

        <Button
          sx={{
            textTransform: "uppercase",
            color: "text.primary",
            fontSize: 13,
          }}
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
          href="/about"
        >
          {t("menu.about")}
        </Button>

        <UserMenu />
        <LanguageSwitch />
      </Toolbar>
    </AppBar>
  );
};
