import { Box, Grid, Typography } from "@mui/material";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";

import { OpenEditionLogo } from "~images/OpenEdition";

import mshparisnordLogo from "../images/about/hsmparisnord_100px.jpg";
import logoFsm from "../images/about/logo-fsm.jpg";
import logoHN from "../images/about/logo-huma-num.jpg";
import logoIcp from "../images/about/logo-icp.jpg";
import logoLp from "../images/about/logo-lp.png";

export const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        padding: 48,
        maxWidth: 1024,
        margin: "0 auto",
      }}
    >
      <Typography variant="h2" gutterBottom={true}>
        {t("about.title")}
      </Typography>
      <Typography variant="subtitle1" gutterBottom={true}>
        {t("about.intro.prefix")}
        <b>Celluloid</b>
        {t("about.intro.suffix")}
      </Typography>
      <Typography variant="subtitle1" gutterBottom={true}>
        {t("about.support")}
      </Typography>
      <Typography variant="subtitle1" gutterBottom={true} pt={1}>
        {t("about.opensource.prefix")}
      </Typography>

      <Trans i18nKey="about.opensource.github" pt={2}>
        <a href="https://github.com/celluloid-camp/"></a>
      </Trans>

      <div
        style={{
          padding: 48,
          textAlign: "center",
        }}
      >
        <Grid container spacing={2} bgcolor={"white"}>
          <Grid item>
            <a href="https://www.icp.fr/" target="_blank" rel="noreferrer">
              <img
                src={logoIcp}
                height="60px"
                alt="Institut Catholique de Paris"
              />
            </a>
          </Grid>
          <Grid item={true}>
            <a
              href="https://fondation-st-matthieu.org/"
              target="_blank"
              rel="noreferrer"
            >
              <img src={logoFsm} height="60px" alt="Fondation Saint-Matthieu" />
            </a>
          </Grid>
          <Grid item={true}>
            <a
              href="https://www.lapaillasse.org/"
              target="_blank"
              rel="noreferrer"
            >
              <img src={logoLp} height="60px" alt="La Paillasse" />
            </a>
          </Grid>
          <Grid item={true}>
            <Box width={40}>
              <a
                href="https://canevas.hypotheses.org/"
                target="_blank"
                rel="noreferrer"
              >
                <OpenEditionLogo color="#eb5b4f" />
              </a>
            </Box>
          </Grid>
          <Grid item={true}>
            <a href="https://www.huma-num.fr/" target="_blank" rel="noreferrer">
              <img src={logoHN} height="60px" alt="Le site de Huma-num" />
            </a>
          </Grid>

          <Grid item={true}>
            <a
              href="https://www.mshparisnord.fr/programmes/consortium-humanum-cannevas/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={mshparisnordLogo}
                height="60px"
                alt="Le site de Huma-num"
              />
            </a>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
