import { UserRecord } from "@celluloid/types";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { loadVideoThunk } from "actions/HomeActions";
import { openStudentSignup } from "actions/Signin";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SharedLayout } from "scenes/Menu/Layout";
import { AsyncAction, EmptyAction } from "types/ActionTypes";
import { AppState } from "types/StateTypes";
import { PeertubeVideoInfo } from "types/YoutubeTypes";

import NewProject from "./components/NewProject";
import ProjectGrid from "./components/ProjectGrid";
import StudentsPict from "./images/Students";
import TeacherPict from "./images/Teacher";

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
        <Grid
          container={true}
          // spacing={40}
          // direction="row"
          // justify="center"
          // alignItems="stretch"
          // alignContent="stretch"
          // className={classes.grid}
        >
          <Grid item={true} sm={12} lg={4} xl={3}>
            <Typography variant="h1" gutterBottom={true}>
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
          </Grid>
          <Grid item={true} sm={12} lg={4} xl={6}>
            <div>
              <Typography variant="h4">{t("home.teachers")}</Typography>
              <TeacherPict />
              <div>
                <div>
                  <TextField
                    style={{
                      width: 300,
                    }}
                    variant="outlined"
                    placeholder={t("home.addVideo")}
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
                    onClick={() => onClickNewProject(newProjectVideoUrl, user)}
                    fullWidth={true}
                  >
                    {t("home.newProject")}
                  </Button>
                </div>
                <NewProject />
              </div>
            </div>
          </Grid>
          <Grid item={true} sm={12} lg={4} xl={3}>
            <div>
              <Typography variant="h4">{t("home.students")}</Typography>
              <StudentsPict />
              <div>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth={true}
                  onClick={() => onClickJoinProject()}
                >
                  {t("home.joinProject")}
                </Button>
              </div>
            </div>
          </Grid>
        </Grid>
      </Box>
      <div style={{ padding: 20 }}>
        <ProjectGrid />
      </div>
    </SharedLayout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);
