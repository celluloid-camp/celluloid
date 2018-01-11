import * as React from 'react';

import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
import { WithStyles } from 'material-ui/styles/withStyles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';

import ProjectGrid from './ProjectGrid';
import NewProject from './NewProject';
import TagData from './types/Tag';
import { NewProjectData, ProjectData } from './types/Project';
import TagsService from './services/Tags';
import ProjectsService from './services/Projects';

const studentsIcon = require('./students.svg');
const teacherIcon = require('./teacher.svg');

const decorate = withStyles(({ palette, spacing }) => ({
  center: {
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  block: {
    padding: spacing.unit * 6
  }
}));

const Home = decorate<{}>(
  class extends React.Component<WithStyles<'content'> & WithStyles<'center'> & WithStyles<'block'>> {

    state = {
      newProjectDialogOpen: false,
      newProjectVideoId: 'krGikyXAR9w',
      tags: [] as TagData[],
      projects: [] as ProjectData[],
      error: undefined
    };

    loadContent() {
      ProjectsService.fetch()
        .then((projects: ProjectData[]) => {
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

    componentWillMount() {
      this.loadContent();
    }

    render() {
      const classes = this.props.classes;

      const showNewProjectDialog = () => {
        this.setState({ newProjectDialogOpen: true });
      };

      const closeNewProjectDialog = (send: boolean, newProject: NewProjectData) => {
        return new Promise((resolve, reject) => {
          if (send) {
            ProjectsService.create(newProject)
              .then((project: ProjectData) => {
                this.setState({ newProjectDialogOpen: false });
                this.loadContent();
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

      const handleVideoIdChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ newProjectVideoId: event.target.value });
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
              <Grid item={true} sm={12} lg={3}>
                <Grid container={true} spacing={24} direction="column">
                  <Grid item={true}>
                    <Typography type="headline" gutterBottom={true}>
                      <b>{`Votre outil pédagogique numérique pour l'analyse de video`}</b>
                    </Typography>
                  </Grid>
                  <Grid item={true}>
                    <Typography type="subheading" gutterBottom={true}>
                      {`Celluloid est une plateforme collaborative pour les enseignants et les élèves.`}
                      <br />
                      <b>{`Créez-vous une séquence de cours`}</b>
                      {` ou trouvez en une déjà construite.`}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item={true} xs={12} sm={6} className={classes.center}>
                <Grid
                  container={true}
                  spacing={24}
                  direction="column"
                  justify="space-between"
                >
                  <Grid item={true}>
                    <img height={100} src={teacherIcon} alt="students icon" />
                  </Grid>
                  <Grid item={true}>
                    <Typography type="title" gutterBottom={true}>
                      {`Créer un nouveau projet`}
                    </Typography>
                    <Divider />
                  </Grid>
                  <Grid item={true}>
                    <Typography type="subheading">
                      {`Autour d'une video de votre choix, construisez une séquence de cours complète pour vos élèves`}
                    </Typography>
                  </Grid>
                  <Grid item={true}>
                    <Grid
                      container={true}
                      direction="row"
                      alignContent="center"
                      alignItems="flex-end"
                      justify="center"
                    >
                      <Grid item={true}>
                        <TextField
                          label="Ajouter un lien vidéo"
                          onChange={handleVideoIdChanged}
                          value={this.state.newProjectVideoId}
                        />
                      </Grid>
                      <Grid item={true}>
                        <Button
                          raised={true}
                          style={{
                            borderRadius: 24,
                            color: 'white'
                          }}
                          color="primary"
                          onClick={showNewProjectDialog}
                        >
                          {`NOUVEAU PROJET`}
                        </Button>
                        <NewProject
                          onClose={closeNewProjectDialog}
                          isOpen={this.state.newProjectDialogOpen}
                          videoId={this.state.newProjectVideoId}
                          tags={this.state.tags}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item={true} xs={12} sm={6} lg={3} className={classes.center}>
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
                    <Typography type="title" gutterBottom={true}>
                      {`Rejoindre un projet`}
                    </Typography>
                    <Divider />
                  </Grid>
                  <Grid item={true}>
                    <Typography type="subheading">
                      {`Vous souhaitez annoter et participer à une séquence organisée par votre
                  professeur`}
                    </Typography>
                  </Grid>
                  <Grid item={true}>
                    <Grid
                      container={true}
                      direction="row"
                      alignContent="center"
                      alignItems="flex-end"
                      justify="center"
                    >
                      <Grid item={true}>
                        <Button raised={true} style={{ borderRadius: 24, color: 'white' }} color="primary">
                          {`REJOINDRE UN PROJET`}
                        </Button>
                      </Grid>
                    </Grid>
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
);

export default Home;