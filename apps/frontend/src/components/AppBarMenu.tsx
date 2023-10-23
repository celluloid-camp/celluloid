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
  const { data, isError } = trpc.user.me.useQuery();

  const location = useLocation();

  const handleCreate = () => {
    if (!isError) {
      navigate(`/create`);
    } else {
      navigate("/signup", { state: { backgroundLocation: location } });
    }
  };

  const handleJoin = () => {
    if (isError) {
      navigate("/signup-student", { state: { backgroundLocation: location } });
    } else {
      navigate("/join", { state: { backgroundLocation: location } });
    }
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      sx={{ height: "100vh", minHeight: "100vh" }}
    >
      <AppBar color="default" position="fixed">
        <Toolbar disableGutters>
          <Box flexGrow={1}>
            <Button component={getButtonLink("/")}>
              <LogoWithLabel />
            </Button>
          </Box>

          <Button
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

          <SigninMenu user={data} />
          <LanguageMenu />
        </Toolbar>
      </AppBar>
      <Offset />
      {children}
      <Footer />
    </Box>
  );
};
