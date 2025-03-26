"use client";

import {
  Box,
  CircularProgress,
  Container,
  Fade,
  Link,
  Paper,
  Stack,
} from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ErrorBoundary } from "react-error-boundary";
import { LogoSign } from "@/components/common/logo-sign";
import { StudentsIcon } from "@/components/home/students-icon";
import { TeacherIcon } from "@/components/home/teacher-icon";
import { Suspense, useCallback } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import {
  ProjectGrid,
  ProjectGridSkeleton,
} from "@/components/home/project-grid";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const { data: session } = useSession();

  const t = useTranslations();
  const router = useRouter();

  const handleJoin = useCallback(() => {
    if (!session) {
      router.push("/student-signup");
    } else {
      router.push("/join");
    }
  }, [session, router]);

  const handleCreate = () => {
    router.push("/create");
  };

  return (
    <Box>
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
                    {t("home.title")}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom={true}>
                    {t("home.description")}
                  </Typography>

                  <Box paddingY={2}>
                    <Typography gutterBottom={true} fontWeight={"bold"}>
                      {t("home.tutoriel.title")}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom={true}>
                      {t.rich("home.tutoriel.description", {
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
                      {t("home.tutoriel.subtitle")}
                    </Typography>

                    <Typography variant="subtitle1" gutterBottom={true}>
                      {t.rich("home.tutoriel.link", {
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
                      sx={{ textTransform: "uppercase", fontSize: 12, mt: 1 }}
                      onClick={() => handleCreate()}
                    >
                      {t("home.newProject")}
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
                      color="primary"
                      onClick={() => handleJoin()}
                      sx={{ textTransform: "uppercase", fontSize: 12, mt: 1 }}
                    >
                      {t("home.joinProject")}
                    </Button>
                  </Box>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Suspense fallback={<ProjectGridSkeleton />}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ resetErrorBoundary }) => (
                <Fade in={true} appear={true}>
                  <Typography
                    variant="h6"
                    align="center"
                    gutterBottom={true}
                    sx={{
                      pt: 4,
                      pb: 1,
                    }}
                  >
                    {t("errors.UNKNOWN")}
                    <Button onClick={() => resetErrorBoundary()}>
                      {t("home.projects.retry")}
                    </Button>
                  </Typography>
                </Fade>
              )}
            >
              <ProjectGrid />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </Suspense>
    </Box>
  );
}
