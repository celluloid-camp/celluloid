import { UserRecord } from "@celluloid/types";
import { Box, Container, Paper, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { loadVideoThunk } from "~actions/HomeActions";
import { openStudentSignup } from "~actions/Signin";
import ProjectGrid from "~components/home/ProjectGrid";
import { LogoSign } from "~components/LogoSign";
import { StudentsIcon } from "~components/StudentsIcon";
import { TeacherIcon } from "~components/TeacherIcon";
import { SharedLayout } from "~scenes/Menu/Layout";
import { AsyncAction, EmptyAction } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";
import { PeertubeVideoInfo } from "~types/YoutubeTypes";

import NewProject from "./components/NewProject";

interface Props {
  user?: UserRecord;
  errors: {
    video?: string;
    projects?: string;
  };
  onClickJoinProject(): EmptyAction;
  onClickNewProject(
    url: string,
    user?: UserRecord
  ): AsyncAction<PeertubeVideoInfo, string>;
}

const mapStateToProps = (state: AppState) => {
  return {
    user: state.user,
    errors: state.home.errors,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onClickJoinProject: () => dispatch(openStudentSignup()),
    onClickNewProject: (url: string, user?: UserRecord) =>
      loadVideoThunk(url, user)(dispatch),
  };
};

const HomeContainer: React.FC<Props> = ({
  onClickJoinProject,
  user,
  errors,
  onClickNewProject,
}) => {
  const [newProjectVideoUrl, setNewProjectVideoUrl] = useState("");

  const { t } = useTranslation();

  const handleVideoUrlChanged = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewProjectVideoUrl(event.target.value);
  };

  return (
    <SharedLayout>
      <Box sx={{ backgroundColor: "brand.green" }}>
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
                  <Box sx={{ width: 200 }}>
                    <LogoSign />
                  </Box>
                  <Typography
                    variant="h3"
                    gutterBottom={true}
                    fontFamily={"abril_fatfaceregular"}
                  >
                    {t("home.title")}
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom={true}>
                    {t("home.description")}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom={true}>
                    {t("home.tutoriel.prefix")}
                    <a
                      href="https://celluloid.hypotheses.org/1365"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("home.tutoriel.suffix")}
                    </a>
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

                    <div>
                      <TextField
                        style={{
                          width: "100%",
                        }}
                        variant="outlined"
                        placeholder={t("home.addVideo") || ""}
                        onChange={handleVideoUrlChanged}
                        value={newProjectVideoUrl}
                        error={errors?.video != undefined}
                        helperText={errors.video}
                      />
                    </div>
                    <div>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ textTransform: "uppercase" }}
                        onClick={() =>
                          onClickNewProject(newProjectVideoUrl, user)
                        }
                      >
                        {t("home.newProject")}
                      </Button>
                    </div>
                    <NewProject />
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
                      onClick={() => onClickJoinProject()}
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

      <ProjectGrid />
    </SharedLayout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);
