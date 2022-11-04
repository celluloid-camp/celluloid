import { UserRecord } from "@celluloid/types";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { loadVideoThunk } from "actions/HomeActions";
import { openStudentSignup } from "actions/Signin";
import classnames from "classnames";
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

const styles = ({ spacing, palette }: Theme) =>
  createStyles({
    center: {
      textAlign: "center",
      marginLeft: "auto",
      marginRight: "auto",
    },
    block: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
    },
    gridWrapper: {
      padding: spacing.unit * 2.5,
    },
    grid: {
      height: "100%",
      padding: spacing.unit * 3,
    },
    formItem: {
      marginTop: spacing.unit * 3,
      display: "flex",
      justifyContent: "flex-end",
      flexDirection: "column",
      height: spacing.unit * 14,
    },
    title: {
      height: spacing.unit * 11,
      marginTop: spacing.unit,
      marginBottom: spacing.unit,
      color: palette.grey[600],
    },
    buttonWrapper: {
      bottom: 0,
      width: 300,
      paddingTop: spacing.unit * 2,
      paddingBottom: spacing.unit * 1,
    },
    description: {
      lineHeight: 1.5,
    },
    tutoriel: {
      lineHeight: 1.5,
    },
  });

interface Props extends WithStyles<typeof styles> {
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
  classes,
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
      <div style={{ padding: 20 }}>
        <Grid
          container={true}
          spacing={40}
          direction="row"
          justify="center"
          alignItems="stretch"
          alignContent="stretch"
          className={classes.grid}
        >
          <Grid item={true} sm={12} lg={4} xl={3}>
            <Typography variant="h3" color="primary" gutterBottom={true}>
              {t("home.title")}
            </Typography>
            <Typography
              variant="subtitle1"
              className={classes.description}
              gutterBottom={true}
            >
              {t("home.description")}
            </Typography>
            <Typography
              variant="subtitle1"
              className={classes.tutoriel}
              gutterBottom={true}
            >
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
          <Grid item={true} sm={12} lg={4} xl={6} className={classes.center}>
            <div className={classes.block}>
              <Typography variant="h4" className={classes.title}>
                {t("home.teachers")}
              </Typography>
              <TeacherPict />
              <div className={classes.formItem}>
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
                <div className={classes.buttonWrapper}>
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
          <Grid item={true} sm={12} lg={4} xl={3} className={classes.center}>
            <div className={classes.block}>
              <Typography variant="h4" className={classes.title}>
                {t("home.students")}
              </Typography>
              <StudentsPict />
              <div
                className={classnames(classes.formItem, classes.buttonWrapper)}
              >
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
      </div>
      <div style={{ padding: 20 }}>
        <ProjectGrid />
      </div>
    </SharedLayout>
  );
};

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(HomeContainer)
);
