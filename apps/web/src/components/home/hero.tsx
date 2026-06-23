"use client";
import { Box, Container, Link, Paper, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { LogoSign } from "@/components/common/logo-sign";
import { StudentsIcon } from "@/components/home/students-icon";
import { TeacherIcon } from "@/components/home/teacher-icon";
import { useSession } from "@/lib/auth-client";

export function HomePageHero() {
  const { data: session } = useSession();
  const t = useTranslations("home");

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: "brand.green",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={{ xs: 3, md: 5 }}
          sx={{
            alignItems: "stretch",
          }}
        >
          <Grid size={{ xs: 12, md: 8 }} sx={{ display: "flex" }}>
            <Stack
              spacing={3}
              sx={{
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Box sx={{ width: { xs: 110, sm: 140 } }}>
                <LogoSign sx={{ width: "100px", height: "auto" }} />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontFamily: "abril_fatfaceregular",
                  }}
                >
                  {t("title")}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ maxWidth: { xs: "100%", md: "90%" } }}
                >
                  {t("description")}
                </Typography>
              </Box>

              <Stack spacing={3}>
                <Box>
                  <Typography
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    {t("tutoriel.title")}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                  >
                    {t.rich("tutoriel.description", {
                      peertube: (chunks: string) => (
                        <Link
                          href="https://joinpeertube.org/fr_FR"
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        >
                          {chunks}
                        </Link>
                      ),
                    })}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    {t("tutoriel.subtitle")}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                  >
                    {t.rich("tutoriel.link", {
                      tutorial: (chunks: string) => (
                        <Link
                          href="https://video.mshparisnord.fr/w/7r2FxoQdYjun6tYWJfHUCa"
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        >
                          {chunks}
                        </Link>
                      ),
                    })}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2.5} sx={{ height: "100%" }}>
              <Paper className="p-8 w-full rounded-lg">
                <Stack
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ width: 120 }}>
                    <TeacherIcon />
                  </Box>
                  <Button
                    data-testid="create"
                    variant="contained"
                    color="primary"
                    size="large"
                    component={NextLink}
                    href="/create"
                    className="uppercase text-sm font-bold rounded-full"
                  >
                    {t("newProject")}
                  </Button>
                </Stack>
              </Paper>

              <Paper className="p-8 w-full">
                <Stack
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ width: 120 }}>
                    <StudentsIcon />
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    component={NextLink}
                    href={session ? "/join" : "/student-signup"}
                    color="primary"
                    className="uppercase text-sm font-bold rounded-full"
                  >
                    {t("joinProject")}
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
