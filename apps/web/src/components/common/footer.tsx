import {
  Box,
  type BoxProps,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type React from "react";
import { LogoSign } from "@/components/common/logo-sign";
import { env } from "@/env";
import { GithubLogo } from "@/images/Github";
import { HumaNumLogo } from "@/images/HumaNum";
import { OpenEditionLogo } from "@/images/OpenEdition";

type FooterProps = BoxProps;

export const Footer: React.FC<FooterProps> = (props) => {
  const t = useTranslations();
  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
      }}
      component={"footer"}
      {...props}
    >
      <Container sx={{ padding: { xs: 5, lg: 5 } }} maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Stack>
              <Link href="/terms-and-conditions" color="white" variant="body2">
                {t("footer.termsAndConditions")}
              </Link>
              <Link href="/legal-notice" color="white" variant="body2">
                {t("footer.legalNotice")}
              </Link>
              <Link href="/api-doc" color="white" variant="body2">
                API
              </Link>
              <Stack direction={"row"} marginTop={2} spacing={1}>
                <Box width={24}>
                  <a
                    href="https://github.com/celluloid-camp"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GithubLogo />
                  </a>
                </Box>
                <Box width={20}>
                  <a
                    href="https://canevas.hypotheses.org/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <OpenEditionLogo />
                  </a>
                </Box>
                <Box width={24}>
                  <a
                    href="https://huma-num.fr/"
                    target="_blank"
                    rel="noreferrer"
                  >
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
                variant="body2"
                gutterBottom={true}
                color="white"
                textAlign={{ lg: "left", sm: "center" }}
              >
                {t.rich("footer.copyright", {
                  link: (chunks) => (
                    <Link
                      href="https://creativecommons.org/licenses/by-nc/2.0/fr/"
                      target="_blank"
                      rel="noreferrer"
                      sx={{ color: "white" }}
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </Typography>
              <Typography variant="body2" color="white">
                {env.NEXT_PUBLIC_VERSION}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
