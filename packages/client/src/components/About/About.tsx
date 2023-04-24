import { Grid, Typography } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { SharedLayout } from "~scenes/Menu";

import logoBlog from "./images/logo-blog-celluloid.jpg";
import logoFsm from "./images/logo-fsm.jpg";
import logoHN from "./images/logo-huma-num.jpg";
import logoIcp from "./images/logo-icp.jpg";
import logoLp from "./images/logo-lp.png";

export const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SharedLayout>
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
        <Typography variant="subtitle1" gutterBottom={true}>
          {t("about.opensource.prefix")}
          <a href="https://github.com/celluloid-camp/">
            {t("about.opensource.github")}
          </a>
        </Typography>
        <div
          style={{
            padding: 48,
            textAlign: "center",
          }}
        >
          <Grid container spacing={2}>
            <Grid item>
              <a href="https://www.icp.fr/" target="_blank" rel="noreferrer">
                <img
                  src={logoIcp}
                  height="100px"
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
                <img
                  src={logoFsm}
                  height="100px"
                  alt="Fondation Saint-Matthieu"
                />
              </a>
            </Grid>
            <Grid item={true}>
              <a
                href="https://www.lapaillasse.org/"
                target="_blank"
                rel="noreferrer"
              >
                <img src={logoLp} height="100px" alt="La Paillasse" />
              </a>
            </Grid>
            <Grid item={true}>
              <a
                href="https://celluloid.hypotheses.org"
                target="_blank"
                rel="noreferrer"
              >
                <img src={logoBlog} height="100px" alt="Le blog Celluloid" />
              </a>
            </Grid>
            <Grid item={true}>
              <a
                href="https://www.huma-num.fr/"
                target="_blank"
                rel="noreferrer"
              >
                <img src={logoHN} height="100px" alt="Le site de Huma-num" />
              </a>
            </Grid>
          </Grid>
        </div>
      </div>
    </SharedLayout>
  );
};
