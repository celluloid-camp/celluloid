import { LogoSign } from "@/components/common/logo-sign";
import { StudentsIcon } from "@/components/home/students-icon";
import { TeacherIcon } from "@/components/home/teacher-icon";
import { Box, Container, Link, Paper, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { getTranslations } from "next-intl/server";

import { auth } from "@celluloid/auth";
import { headers } from "next/headers";
import NextLink from "next/link";

export async function HomePageHero() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const t = await getTranslations("home");
  return (
    <Box sx={{ backgroundColor: "brand.green" }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 8 }}>
            <Box
              display={"flex"}
              alignContent={"center"}
              alignItems={"center"}
              sx={{ height: "100%" }}
            >
              <Box display={"flex"} flexDirection={"column"}>
                <Box sx={{ width: "20%" }}>
                  <LogoSign />
                </Box>
                <Typography
                  variant="h4"
                  fontFamily={"abril_fatfaceregular"}
                  gutterBottom
                >
                  {t("title")}
                </Typography>
                <Typography variant="subtitle1" gutterBottom={true}>
                  {t("description")}
                </Typography>

                <Box paddingY={2}>
                  <Typography gutterBottom={true} fontWeight={"bold"}>
                    {t("tutoriel.title")}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom={true}>
                    {t.rich("tutoriel.description", {
                      peertube: (chunks) => (
                        <Link
                          href="https://joinpeertube.org/fr_FR"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {chunks}
                        </Link>
                      ),
                    })}
                  </Typography>
                </Box>

                <Box paddingY={2}>
                  <Typography gutterBottom={true} fontWeight={"bold"}>
                    {t("tutoriel.subtitle")}
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom={true}>
                    {t.rich("tutoriel.link", {
                      tutorial: (chunks) => (
                        <Link
                          href="https://video.mshparisnord.fr/w/7r2FxoQdYjun6tYWJfHUCa"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {chunks}
                        </Link>
                      ),
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack spacing={4} paddingY={5} alignItems={"center"}>
              <Paper sx={{ width: "100%", paddingY: 4 }}>
                <Box
                  sx={{
                    justifyContent: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                    }}
                  >
                    <TeacherIcon />
                  </Box>

                  <Button
                    data-testid="create"
                    variant="contained"
                    color="primary"
                    size="large"
                    component={NextLink}
                    href="/create"
                    sx={{ textTransform: "uppercase", fontSize: 12, mt: 1 }}
                  >
                    {t("newProject")}
                  </Button>
                </Box>
              </Paper>
              <Paper sx={{ width: "100%", paddingY: 4 }}>
                <Box
                  sx={{
                    justifyContent: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                    }}
                  >
                    <StudentsIcon />
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    component={NextLink}
                    href={session ? "/join" : "/student-signup"}
                    color="primary"
                    sx={{ textTransform: "uppercase", fontSize: 12, mt: 1 }}
                  >
                    {t("joinProject")}
                  </Button>
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
