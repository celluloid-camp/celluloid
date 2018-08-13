import * as React from 'react';

import Button from '@material-ui/core/Button';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';

import ProjectGrid from './components/ProjectGrid';
import NewProject from './components/NewProject';
import TagsService from 'services/TagService';
import ProjectsService from 'services/ProjectService';

import { WithUser } from 'types/UserTypes';

import {
  NewProjectData,
  DisplayProjectData,
  TagData
} from '@celluloid/commons';
import { YoutubeVideo } from 'types/YoutubeTypes';

import YouTubeService from 'services/YoutubeService';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { openStudentSignup } from '@celluloid/client/src/actions/Signin';
import { Action } from 'types/ActionTypes';

const studentsIcon = require('images/students.svg');
const teacherIcon = require('images/teacher.svg');

const styles = ({ spacing }: Theme) => createStyles({
  center: {
    textAlign: 'center' as 'center',
    marginLeft: 'auto' as 'auto',
    marginRight: 'auto' as 'auto',
    height: '100%'
  },
  block: {
    padding: spacing.unit * 6
  }
});

interface Props extends WithUser, WithStyles<typeof styles> {
  onClickJoinProject(): Action<null>;
}

interface State {
  newProjectDialogOpen: boolean;
  newProjectVideoUrl: string;
  video?: YoutubeVideo;
  tags: TagData[];
  projects: DisplayProjectData[];
  videoError?: string;
  error?: string;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onClickJoinProject: () => dispatch(openStudentSignup())
  };
};

export default withStyles(styles)(
  connect(null, mapDispatchToProps)(
  class extends React.Component<Props, State> {
    state = {
      newProjectDialogOpen: false,
      newProjectVideoUrl: '',
      tags: [] as TagData[],
      projects: [] as DisplayProjectData[],
      videoError: undefined,
      error: undefined,
      video: undefined
    } as State;

    load() {
      ProjectsService.fetch()
        .then((projects: DisplayProjectData[]) => {
          this.setState({ projects, error: undefined });
          TagsService.fetch()
            .then((tags: TagData[]) => {
              this.setState({ tags, error: undefined });
            })
            .catch((error: Error) => {
              this.setState({ error: error.message });
            });
        })
        .catch((error: Error) => {
          this.setState({ error: error.message });
        });
    }

    componentDidMount() {
      this.load();
    }

    componentDidUpdate(prevProps: Props) {
      if (prevProps.user !== this.props.user) {
        this.load();
      }
    }

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
        newProject: NewProjectData
      ) => {
        return new Promise((resolve, reject) => {
          if (send) {
            ProjectsService.create(newProject)
              .then((project: DisplayProjectData) => {
                this.setState({ newProjectDialogOpen: false });
                this.load();
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
        <div>
          <div style={{ padding: 20 }}>
            <Grid
              container={true}
              spacing={40}
              direction="row"
              justify="space-around"
              alignItems="stretch"
              className={classes.block}
            >
              <Grid item={true} md={12} lg={3}>
                <Typography variant="headline" gutterBottom={true}>
                  <b>{`Apprendre ensemble avec une vidéo`}</b>
                </Typography>
                <Typography variant="subheading" gutterBottom={true}>
                  {`Partagez une vidéo Youtube avec vos élèves, vos` +
                    ` étudiant.e.s ou un groupe en formation : créez` +
                    ` votre projet pédagogique, annotez les images,` +
                    ` posez des questions et répondez à celles des` +
                    ` participant.e.s.`}
                </Typography>
              </Grid>
              <Grid item={true} xs={12} md={6} className={classes.center}>
                <Grid
                  container={true}
                  spacing={24}
                  direction="column"
                  justify="space-between"
                >
                  <Grid item={true}>
                    <img height={100} src={teacherIcon} alt="teacher icon" />
                  </Grid>
                  <Grid item={true}>
                    <TextField
                      style={{
                        width: 384
                      }}
                      label="Ajouter un lien vers une vidéo YouTube..."
                      onChange={handleVideoUrlChanged}
                      value={this.state.newProjectVideoUrl}
                      error={this.state.videoError ? true : false}
                      fullWidth={true}
                      helperText={this.state.videoError}
                    />
                  </Grid>
                  <Grid item={true}>
                    <Button
                      variant="raised"
                      color="primary"
                      onClick={showNewProjectDialog}
                    >
                      {`Nouveau projet`}
                    </Button>
                    {this.state.video && (
                      <NewProject
                        onClose={closeNewProjectDialog}
                        isOpen={this.state.newProjectDialogOpen}
                        video={this.state.video}
                        tags={this.state.tags}
                      />
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                item={true}
                xs={12}
                sm={6}
                lg={3}
                className={classes.center}
              >
                <Grid
                  container={true}
                  spacing={24}
                  direction="column"
                  justify="space-between"
                >
                  <Grid item={true}>
                    <img height={100} src={studentsIcon} alt="students icon" />
                  </Grid>
                  <Grid item={true}>
                    <Button
                      variant="raised"
                      color="primary"
                      onClick={() => onClickJoinProject()}
                    >
                      {`Rejoindre un projet`}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
          <Divider />
          <ProjectGrid projects={this.state.projects} />
        </div>
      );
    }
  }
));
