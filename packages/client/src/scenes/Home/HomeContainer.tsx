import {
  listProjectsThunk
} from '@celluloid/client/src/actions/ProjectActions';
import {
  ProjectCreateData,
  ProjectGraphRecord,
  UserRecord
} from '@celluloid/types';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles
} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { openStudentSignup } from 'actions/Signin';
import classnames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import ProjectsService from 'services/ProjectService';
import YouTubeService from 'services/YoutubeService';
import { AsyncAction, EmptyAction } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';
import { YoutubeVideo } from 'types/YoutubeTypes';

import NewProject from './components/NewProject';
import ProjectGrid from './components/ProjectGrid';
import StudentsPict from './images/Students';
import TeacherPict from './images/Teacher';

const styles = ({ spacing }: Theme) => createStyles({
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
    marginBottom: spacing.unit
  },
  buttonWrapper: {
    bottom: 0,
    width: 300,
    paddingTop: spacing.unit * 2,
    paddingBottom: spacing.unit * 1
  }
});

interface Props extends WithStyles<typeof styles> {
  user?: UserRecord;
  error?: string;
  onClickJoinProject(): EmptyAction;
  onNewProjectCreated(): AsyncAction<ProjectGraphRecord[], string>;
}

interface State {
  newProjectDialogOpen: boolean;
  newProjectVideoUrl: string;
  video?: YoutubeVideo;
  videoError?: string;
}

const mapStateToProps = (state: AppState) => {
  return {
    user: state.user,
    error: state.home.error
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onClickJoinProject: () => dispatch(openStudentSignup()),
    onNewProjectCreated: () => listProjectsThunk()(dispatch)
  };
};

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(
    class extends React.Component<Props, State> {
      state = {
        newProjectDialogOpen: false,
        newProjectVideoUrl: '',
        videoError: undefined,
        video: undefined
      } as State;

      render() {
        const { onClickJoinProject, classes } = this.props;

        const showNewProjectDialog = () => {
          try {
            const parsedVideoUrl = new URL(this.state.newProjectVideoUrl);
            const videoId = parsedVideoUrl.hostname.endsWith('youtu.be')
              ? parsedVideoUrl.pathname.replace(/\//, '')
              : parsedVideoUrl.searchParams.get('v');

            if (videoId) {
              YouTubeService.getVideoNameById(videoId)
                .then((videoTitle: string) => {
                  this.setState({
                    video: {
                      id: videoId,
                      title: videoTitle,
                      thumbnailUrl: `http://img.youtube.com/vi/${videoId}/0.jpg`
                    },
                    newProjectDialogOpen: true
                  });
                })
                .catch(() => {
                  this.setState({
                    video: undefined,
                    newProjectDialogOpen: false,
                    videoError: `Ceci n'est pas un lien YouTube valide`
                  });
                });
            } else {
              this.setState({
                video: undefined,
                newProjectDialogOpen: false,
                videoError: `Ceci n'est pas un lien YouTube valide`
              });
            }
          } catch (err) {
            this.setState({
              video: undefined,
              newProjectDialogOpen: false,
              videoError: `Ceci n'est pas un lien YouTube valide`
            });
          }
        };

        const closeNewProjectDialog = (
          send: boolean,
          newProject: ProjectCreateData
        ) => {
          return new Promise((resolve, reject) => {
            if (send) {
              ProjectsService.create(newProject)
                .then(() => {
                  this.props.onNewProjectCreated();
                  this.setState({ newProjectDialogOpen: false });
                  resolve();
                })
                .catch(error => {
                  reject(error);
                });
            } else {
              this.setState({ newProjectDialogOpen: false });
              resolve();
            }
          });
        };

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
                  <Typography variant="display2" color="primary" gutterBottom={true}>
                    {`Apprendre ensemble avec une vidéo`}
                  </Typography>
                  <Typography variant="subheading" gutterBottom={true}>
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
                      variant="display1"
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
                          label="Ajouter un lien vers une vidéo YouTube..."
                          onChange={handleVideoUrlChanged}
                          value={this.state.newProjectVideoUrl}
                          error={this.state.videoError ? true : false}
                          helperText={this.state.videoError}
                        />
                      </div>
                      <div className={classes.buttonWrapper}>
                        <Button
                          variant="raised"
                          color="primary"
                          onClick={showNewProjectDialog}
                          fullWidth={true}
                        >
                          {`Nouveau projet`}
                        </Button>
                      </div>
                      <div>
                        {this.state.video &&
                          <NewProject
                            onClose={closeNewProjectDialog}
                            isOpen={this.state.newProjectDialogOpen}
                            video={this.state.video}
                          />
                        }
                      </div>
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
                      variant="display1"
                      className={classes.title}
                    >
                      {`Élèves et étudiants`}
                    </Typography>
                    <StudentsPict />
                    <div className={classnames(classes.formItem, classes.buttonWrapper)}>
                      <Button
                        variant="raised"
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
