import { Box, Link, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type * as React from "react";
import euFunded from "@/images/about/eu_funded_en.jpg";
import logoFsm from "@/images/about/logo-fsm.jpg";
import logoHN from "@/images/about/logo-huma-num.jpg";
import logoIcp from "@/images/about/logo-icp.jpg";
import logoLp from "@/images/about/logo-lp.png";
import mshparisnordLogo from "@/images/about/logo-MSH-Paris-Nord-2025.png";
import logoOscars from "@/images/about/logo-oscars.jpg";
import logoUL from "@/images/about/logo-ul.png";
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
        sx={{
          fontFamily: "abril_fatfaceregular",
        }}
      >
        {t("about.title")}
      </Typography>
      <Typography variant="subtitle1" gutterBottom={true}>
        {t.rich("about.intro", {
          celluloid: (chunks: string) => <b>{chunks}</b>,
          consortium: (chunks: string) => (
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
      <Typography
        variant="subtitle1"
        gutterBottom={true}
        sx={{
          pt: 1,
        }}
      >
        {t.rich("about.opensource.prefix", {
          canevas: (chunks: string) => (
            <Link
              href="https://canevas.hypotheses.org/a-propos"
              target="_blank"
              rel="noreferrer"
            >
              {chunks}
            </Link>
          ),
          oasis: (chunks: string) => (
            <Link
              href="https://oscars-project.eu/projects/oasis-open-audiovisual-science-innovation-scheme"
              target="_blank"
              rel="noreferrer"
            >
              {chunks}
            </Link>
          ),
          mshpn: (chunks: string) => (
            <Link
              href="https://www.mshparisnord.fr/programmes/consortium-humanum-cannevas/"
              target="_blank"
              rel="noreferrer"
            >
              {chunks}
            </Link>
          ),
          younes: (chunks: string) => (
            <Link
              href="https://github.com/younes200"
              target="_blank"
              rel="noreferrer"
            >
              {chunks}
            </Link>
          ),
        })}
      </Typography>
      <Typography
        variant="subtitle1"
        gutterBottom={true}
        sx={{
          pt: 1,
        }}
      >
        {t.rich("about.opensource.github", {
          github: (chunks: string) => (
            <Link
              href="https://github.com/celluloid-camp/"
              target="_blank"
              rel="noreferrer"
            >
              {chunks}
            </Link>
          ),
        })}
      </Typography>
      <div className="bg-white p-5 mt-10">
        <Grid
          container
          spacing={10}
          className=" p-5"
          sx={{ justifyContent: "space-between" }}
        >
          <Grid size="auto">
            <a
              href="https://www.mshparisnord.fr/programmes/consortium-humanum-cannevas/"
              target="_blank"
              rel="noreferrer"
            >
              <Image
                src={mshparisnordLogo}
                height={60}
                alt="Maison des Sciences Humaines et sociales Paris Nord"
              />
            </a>
          </Grid>
          <Grid size="auto">
            <a
              href="https://univ-lorraine.fr/"
              target="_blank"
              rel="noreferrer"
            >
              <Image src={logoUL} height={60} alt="Université de Lorraine" />
            </a>
          </Grid>
          <Grid size="auto">
            <a href="https://www.icp.fr/" target="_blank" rel="noreferrer">
              <Image
                src={logoIcp}
                height={60}
                alt="Institut Catholique de Paris"
              />
            </a>
          </Grid>
          <Grid size="auto">
            <a
              href="https://fondation-st-matthieu.org/"
              target="_blank"
              rel="noreferrer"
            >
              <Image src={logoFsm} height={60} alt="Fondation Saint-Matthieu" />
            </a>
          </Grid>
          <Grid size="auto">
            <a
              href="https://www.lapaillasse.org/"
              target="_blank"
              rel="noreferrer"
            >
              <Image src={logoLp} height={60} alt="La Paillasse" />
            </a>
          </Grid>
          <Grid size="auto">
            <Box
              sx={{
                width: 40,
              }}
            >
              <a
                href="https://canevas.hypotheses.org/"
                target="_blank"
                rel="noreferrer"
              >
                <OpenEditionLogo color="#eb5b4f" />
              </a>
            </Box>
          </Grid>
          <Grid size="auto">
            <a href="https://www.huma-num.fr/" target="_blank" rel="noreferrer">
              <Image src={logoHN} height={60} alt="Le site de Huma-num" />
            </a>
          </Grid>
          <Grid size="auto">
            <a
              href="https://oscars-project.eu/projects/oasis-open-audiovisual-science-innovation-scheme"
              target="_blank"
              rel="noreferrer"
            >
              <Image src={logoOscars} height={80} alt="Le site de Oscars" />
            </a>
          </Grid>
        </Grid>
        <Grid container sx={{ justifyContent: "center" }}>
          <Grid size="auto">
            <Image src={euFunded} height={50} alt="EU funded" />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
