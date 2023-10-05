import {
  Box,
  BoxProps,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { Trans } from "react-i18next";

import { GithubLogo } from "~images/Github";
import { HumaNumLogo } from "~images/HumaNum";
import { OpenEditionLogo } from "~images/OpenEdition";

import { LogoSign } from "./LogoSign";

type FooterProps = BoxProps;

export const Footer: React.FC<FooterProps> = (props) => (
  <Box
    sx={{
      backgroundColor: "primary.main",
    }}
    component={"footer"}
    {...props}
  >
    <Container sx={{ padding: { xs: 5, lg: 10 } }} maxWidth="lg">
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <Stack>
            <Link href="/terms-and-conditions" color="white">
              <Trans i18nKey={"footer.termsAndConditions"} />
            </Link>
            <Link href="/legal-notice" color="white">
              <Trans i18nKey={"footer.legalNotice"} />
            </Link>
            <Stack direction={"row"} marginTop={2} spacing={1}>
              <Box width={34}>
                <a
                  href="https://github.com/celluloid-camp"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GithubLogo />
                </a>
              </Box>
              <Box width={29}>
                <a
                  href="https://canevas.hypotheses.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <OpenEditionLogo />
                </a>
              </Box>
              <Box width={34}>
                <a href="https://huma-num.fr/" target="_blank" rel="noreferrer">
                  <HumaNumLogo />
                </a>
              </Box>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              flexDirection: "column",
              alignItems: { lg: "flex-end", sm: "center" },
              display: "flex",
            }}
          >
            <Box sx={{ width: 100 }}>
              <LogoSign />
            </Box>
            <Typography
              variant="subtitle1"
              gutterBottom={true}
              color="white"
              textAlign={{ lg: "left", sm: "center" }}
            >
              <Trans
                i18nKey={"footer.copyright"}
                defaults="© 2018 Institut Catholique de Paris"
              />{" "}
              version: {JSON.stringify(process.env)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  </Box>
);
