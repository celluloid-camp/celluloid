import { Box, Grid, Link, Typography } from "@mui/material";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type * as React from "react";
import mshparisnordLogo from "@/images/about/hsmparisnord_100px.jpg";
import logoFsm from "@/images/about/logo-fsm.jpg";
import logoHN from "@/images/about/logo-huma-num.jpg";
import logoIcp from "@/images/about/logo-icp.jpg";
import logoLp from "@/images/about/logo-lp.png";
import { OpenEditionLogo } from "@/images/OpenEdition";

export default function About() {
  const t = useTranslations();

  return (
    <div
      style={{
        padding: 48,
        maxWidth: 1024,
        margin: "0 auto",
        flexGrow: 1,
      }}
    >
      <Typography
        variant="h2"
        gutterBottom={true}
        fontFamily={"abril_fatfaceregular"}
      >
        {t("about.title")}
      </Typography>
      <Typography variant="subtitle1" gutterBottom={true}>
        {t.rich("about.intro", {
          celluloid: (chunks) => <b>{chunks}</b>,
          consortium: (chunks) => (
            <Link
              href="https://www.huma-num.fr/les-consortiums-hn/"
              target="_blank"
              rel="noreferrer"
            >
              {chunks}
            </Link>
          ),
        })}
      </Typography>
      <Typography variant="subtitle1" gutterBottom={true}>
        {t("about.support")}
      </Typography>
      <Typography variant="subtitle1" gutterBottom={true} pt={1}>
        {t.rich("about.opensource.prefix", {
          canevas: (chunks) => (
            <Link
              href="https://canevas.hypotheses.org/a-propos"
              target="_blank"
              rel="noreferrer"
            >
              {chunks}
            </Link>
          ),
          mshpn: (chunks) => (
            <Link
              href="https://www.mshparisnord.fr/programmes/consortium-humanum-cannevas/"
              target="_blank"
              rel="noreferrer"
            >
              {chunks}
            </Link>
          ),
        })}
      </Typography>

      {t.rich("about.opensource.github", {
        github: (chunks) => (
          <Link
            href="https://github.com/celluloid-camp/"
            target="_blank"
            rel="noreferrer"
          >
            {chunks}
          </Link>
        ),
      })}

      <div
        style={{
          padding: 48,
          textAlign: "center",
        }}
      >
        <Grid container spacing={2} bgcolor={"white"}>
          <Grid item>
            <a href="https://www.icp.fr/" target="_blank" rel="noreferrer">
              <Image
                src={logoIcp}
                height={60}
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
              <Image src={logoFsm} height={60} alt="Fondation Saint-Matthieu" />
            </a>
          </Grid>
          <Grid item={true}>
            <a
              href="https://www.lapaillasse.org/"
              target="_blank"
              rel="noreferrer"
            >
              <Image src={logoLp} height={60} alt="La Paillasse" />
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
              <Image src={logoHN} height={60} alt="Le site de Huma-num" />
            </a>
          </Grid>

          <Grid item={true}>
            <a
              href="https://www.mshparisnord.fr/programmes/consortium-humanum-cannevas/"
              target="_blank"
              rel="noreferrer"
            >
              <Image
                src={mshparisnordLogo}
                height={60}
                alt="Le site de Huma-num"
              />
            </a>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
