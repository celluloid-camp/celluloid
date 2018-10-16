import { loadVideoThunk } from '@celluloid/client/src/actions/HomeActions';
import { listProjectsThunk } from '@celluloid/client/src/actions/ProjectActions';
import { ProjectGraphRecord, UserRecord } from '@celluloid/types';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { openStudentSignup } from 'actions/Signin';
import classnames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AsyncAction, EmptyAction } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';
import { YoutubeVideo } from 'types/YoutubeTypes';

import NewProject from './components/NewProject';
import ProjectGrid from './components/ProjectGrid';
import StudentsPict from './images/Students';
import TeacherPict from './images/Teacher';

const styles = ({ spacing, palette }: Theme) => createStyles({
  center: {
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  block: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  gridWrapper: {
    padding: spacing.unit * 2.5
  },
  grid: {
    height: '100%',
    padding: spacing.unit * 3,
  },
  formItem: {
    marginTop: spacing.unit * 3,
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'column',
    height: spacing.unit * 14,
  },
  title: {
    height: spacing.unit * 11,
    marginTop: spacing.unit,
    marginBottom: spacing.unit,
    color: palette.grey[600]
  },
  buttonWrapper: {
    bottom: 0,
    width: 300,
    paddingTop: spacing.unit * 2,
    paddingBottom: spacing.unit * 1
  },
  description: {
    lineHeight: 1.5
  }
});

interface Props extends WithStyles<typeof styles> {
  user?: UserRecord;
  errors: {
    video?: string,
    projects?: string
  };
  onClickJoinProject(): EmptyAction;
  onClickNewProject(url: string): AsyncAction<YoutubeVideo, string>;
  onNewProjectCreated(): AsyncAction<ProjectGraphRecord[], string>;
}

interface State {
  newProjectVideoUrl: string;
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
    onNewProjectCreated: () => listProjectsThunk()(dispatch),
    onClickNewProject: (url: string) => loadVideoThunk(url)(dispatch)
  };
};

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(
    class extends React.Component<Props, State> {
      state = {
        newProjectVideoUrl: '',
      } as State;

      render() {
        const { onClickJoinProject, classes } = this.props;

        const handleVideoUrlChanged = (
          event: React.ChangeEvent<HTMLInputElement>
        ) => {
          this.setState({ newProjectVideoUrl: event.target.value });
        };

        return (
          <>
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
                <Grid
                  item={true}
                  sm={12}
                  lg={4}
                  xl={3}
                >
                  <Typography variant="h3" color="primary" gutterBottom={true}>
                    {`Apprendre ensemble avec une`}&nbsp;{`vidéo`}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    className={classes.description}
                    gutterBottom={true}
                  >
                    {`Partagez une vidéo Youtube avec vos élèves, vos` +
                      ` étudiant.e.s ou un groupe en formation : créez` +
                      ` votre projet pédagogique, annotez les images,` +
                      ` posez des questions et répondez à celles des` +
                      ` participant.e.s.`}
                  </Typography>
                </Grid>
                <Grid
                  item={true}
                  sm={12}
                  lg={4}
                  xl={6}
                  className={classes.center}
                >
                  <div className={classes.block}>
                    <Typography
                      variant="h4"
                      className={classes.title}
                    >
                      {`Enseignants et formateurs`}
                    </Typography>
                    <TeacherPict />
                    <div
                      className={classes.formItem}
                    >
                      <div>
                        <TextField
                          style={{
                            width: 300
                          }}
                          variant="outlined"
                          placeholder="Ajouter un lien vers une vidéo YouTube..."
                          onChange={handleVideoUrlChanged}
                          value={this.state.newProjectVideoUrl}
                          error={!!this.props.errors.video}
                          helperText={this.props.errors.video}
                        />
                      </div>
                      <div className={classes.buttonWrapper}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => this.props.onClickNewProject(this.state.newProjectVideoUrl)}
                          fullWidth={true}
                        >
                          {`Nouveau projet`}
                        </Button>
                      </div>
                      <NewProject />
                    </div>
                  </div>
                </Grid>
                <Grid
                  item={true}
                  sm={12}
                  lg={4}
                  xl={3}
                  className={classes.center}
                >
                  <div className={classes.block}>
                    <Typography
                      variant="h4"
                      className={classes.title}
                    >
                      {`Élèves et étudiants`}
                    </Typography>
                    <StudentsPict />
                    <div className={classnames(classes.formItem, classes.buttonWrapper)}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth={true}
                        onClick={() => onClickJoinProject()}
                      >
                        {`Rejoindre un projet`}
                      </Button>
                    </div>
                  </div>
                </Grid>
              </Grid>
            </div>
            <Divider />
            <div style={{ padding: 20 }}>
              <ProjectGrid />
            </div>
          </>
        );
      }
    }
  ));
