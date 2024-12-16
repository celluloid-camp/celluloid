import {
  AppBar,
  Box,
  type BoxProps,
  Button,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import type * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getButtonLink } from "~components/ButtonLink";
import { Footer } from "~components/Footer";
import { LogoWithLabel } from "~components/LogoWithLabel";
import { SigninMenu } from "~components/SigninMenu";

import { LanguageMenu } from "./LanguageMenu";
import { useSession } from "~/lib/auth-client";

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

export const AppBarMenu: React.FC<BoxProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: session } = useSession();

  const handleCreate = () => {
    if (session) {
      navigate("/create");
    } else {
      navigate("/signup", { state: { backgroundLocation: "/" } });
    }
  };

  const handleJoin = () => {
    if (!session) {
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
              {/* <LogoWithLabel /> */}
              <Typography
                variant="h5"
                fontFamily={"abril_fatfaceregular"}
                color="black"
              >
                Espact@teur
              </Typography>
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

          <SigninMenu user={session?.user} />
          <LanguageMenu />
        </Toolbar>
      </AppBar>
      <Offset />
      {children}
      <Footer />
    </Box>
  );
};
