import { AppBar, Box, BoxProps, Button, styled, Toolbar } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { getButtonLink } from "~components/ButtonLink";
import { Footer } from "~components/Footer";
import { LogoWithLabel } from "~components/LogoWithLabel";
import { SigninMenu } from "~components/SigninMenu";
import { trpc } from "~utils/trpc";

import { LanguageMenu } from "./LanguageMenu";

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

export const AppBarMenu: React.FC<BoxProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isError } = trpc.user.me.useQuery(
    {},
    { retry: false, keepPreviousData: false, cacheTime: 0 }
  );

  const location = useLocation();

  const handleCreate = () => {
    if (data) {
      navigate(`/create`);
    } else {
      navigate("/signup", { state: { backgroundLocation: "/" } });
    }
  };

  const handleJoin = () => {
    if (!data) {
      navigate("/signup-student", { state: { backgroundLocation: "/" } });
    } else {
      navigate("/join", { state: { backgroundLocation: "/" } });
    }
  };

  return (
    <Box display={"flex"} flexDirection={"column"}>
      <AppBar color="default" position="fixed">
        <Toolbar disableGutters>
          <Box flexGrow={1}>
            <Button component={getButtonLink("/")}>
              <LogoWithLabel />
            </Button>
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
            {t("menu.create", "Créer")}
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
            {t("menu.join", "Rejoindre")}
          </Button>

          <Button
            sx={{
              textTransform: "uppercase",
              color: "text.primary",
              fontSize: 13,
            }}
            href="/"
          >
            {t("menu.explore", "Explorer")}
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

          <SigninMenu user={!isError ? data : null} />
          <LanguageMenu />
        </Toolbar>
      </AppBar>
      <Offset />
      {children}
      <Footer />
    </Box>
  );
};
