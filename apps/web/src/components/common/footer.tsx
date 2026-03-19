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
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Stack>
              <Link
                href="/terms-and-conditions"
                className="text-white"
                variant="body2"
              >
                {t("footer.termsAndConditions")}
              </Link>
              <Link href="/legal-notice" className="text-white" variant="body2">
                {t("footer.legalNotice")}
              </Link>
              <Link href="/api-doc" className="text-white" variant="body2">
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
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
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
                className="text-white"
                textAlign={{ lg: "left", sm: "center" }}
              >
                {t.rich("footer.copyright", {
                  link: (chunks: string) => (
                    <Link
                      href="https://creativecommons.org/licenses/by-nc/2.0/fr/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-white"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </Typography>
              <Typography variant="body2" className="text-white">
                {env.NEXT_PUBLIC_VERSION} - {env.NEXT_PUBLIC_STAGE}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
