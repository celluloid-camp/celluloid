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

import { LogoSign } from "./LogoSign";

type FooterProps = BoxProps;

export const Footer: React.FC<FooterProps> = (props) => (
  <footer>
    <Box sx={{ backgroundColor: "primary.main" }} {...props}>
      <Container sx={{ padding: 10 }} maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Stack>
              <Link href="/terms-and-conditions" color="white">
                <Trans i18nKey={"footer.termsAndConditions"} />
              </Link>
              <Link href="/legal-notice" color="white">
                <Trans i18nKey={"footer.legalNotice"} />
              </Link>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                flexDirection: "column",
                alignItems: "flex-end",
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
                textAlign={"right"}
              >
                <Trans
                  i18nKey={"footer.copyright"}
                  defaults="© 2018 Institut Catholique de Paris"
                />
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  </footer>
);
