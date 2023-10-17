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
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import * as React from "react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { openStudentSignup } from "~actions/Signin";
import { ProjectGrid } from "~components/home/ProjectGrid";
import { LogoSign } from "~components/LogoSign";
import { StudentsIcon } from "~components/StudentsIcon";
import { TeacherIcon } from "~components/TeacherIcon";
import { trpc } from "~utils/trpc";

export const HomePage: React.FC = () => {
  const { isError } = trpc.user.me.useQuery();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const handleJoin = () => {
    dispatch(openStudentSignup());
  };

  const handleCreate = () => {
    if (!isError) {
      navigate(`/create`);
    } else {
      dispatch(openStudentSignup());
    }
  };

  return (
    <React.Fragment>
      <Box sx={{ backgroundColor: "brand.green", height: "100%" }}>
        <Container maxWidth="lg">
          <Grid container={true}>
            <Grid item xs={12} sm={6}>
              <Box
                display={"flex"}
                alignContent={"center"}
                alignItems={"center"}
                sx={{ height: "100%" }}
              >
                <Box display={"flex"} flexDirection={"column"}>
                  <Box sx={{ width: "40%" }}>
                    <LogoSign />
                  </Box>
                  <Typography
                    variant="h4"
                    gutterBottom={true}
                    fontFamily={"abril_fatfaceregular"}
                  >
                    {t("home.title")}
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom={true}>
                    {t("home.description")}
                  </Typography>
                  <Typography
                    variant="h5"
                    gutterBottom={true}
                    fontFamily={"abril_fatfaceregular"}
                  >
                    {t("home.tutoriel.title")}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom={true}>
                    {t("home.tutoriel.description")}
                  </Typography>
                  <Typography
                    variant="h6"
                    gutterBottom={true}
                    fontFamily={"abril_fatfaceregular"}
                  >
                    <Trans i18nKey={"home.tutoriel.subtitle"}></Trans>
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom={true}>
                    <Trans i18nKey={"home.tutoriel.link"}>
                      default
                      <Link
                        href="https://canevas.hypotheses.org/560"
                        target="_blank"
                        rel="noreferrer"
                      >
                        https://canevas.hypotheses.org/560
                      </Link>
                    </Trans>
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack
                spacing={4}
                paddingY={5}
                marginX={10}
                alignItems={"center"}
              >
                <Paper
                  sx={{
                    p: "2px 4px",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    alignItems: "center",
                    width: "100%",
                    padding: 5,
                  }}
                >
                  <Typography variant="h5" fontFamily={"abril_fatfaceregular"}>
                    {t("home.teachers")}
                  </Typography>
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
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ textTransform: "uppercase" }}
                      onClick={() => handleCreate()}
                    >
                      {t("home.newProject")}
                    </Button>
                  </Box>
                </Paper>
                <Paper
                  sx={{
                    p: "2px 4px",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    alignItems: "center",
                    width: "100%",
                    padding: 5,
                  }}
                >
                  <Typography variant="h5" fontFamily={"abril_fatfaceregular"}>
                    {t("home.students")}
                  </Typography>
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
                      sx={{ textTransform: "uppercase" }}
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

      <Suspense
        fallback={
          <Box
            mx={2}
            my={10}
            display={"flex"}
            alignContent={"center"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Box>
              <CircularProgress />
            </Box>
          </Box>
        }
      >
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ resetErrorBoundary, error }) => (
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
                    <Trans i18nKey="ERR_UNKOWN" />
                    <Button onClick={() => resetErrorBoundary()}>
                      Try again
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
    </React.Fragment>
  );
};
