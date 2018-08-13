import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';
import Video from './scenes/Video';

import { ProjectData, AnnotationRecord } from '@celluloid/commons';

import { RouteComponentProps, withRouter } from 'react-router';

import ProjectsService from 'services/ProjectService';
import { WithUser } from 'types/UserTypes';
import ShareProject from './components/Share';

import ShareIcon from '@material-ui/icons/Share';
import { WithStyles, withStyles, createStyles, Theme } from '@material-ui/core/styles';

const styles = ({ spacing }: Theme) => createStyles({
  root: {
    minHeight: 'calc(100vh - 64px)'
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    textAlign: 'center' as 'center',
    backgroundColor: 'black'
  },
  video: {
    height: '100%',
    maxWidth: 1024,
    margin: '0 auto',
  },
  content: {
    padding: spacing.unit * 3,
    minHeight: 'calc(100% - 64px)',
    textAlign: 'center' as 'center',
    maxWidth: 1024,
    margin: '0 auto'
  }
});

interface ProjectParams {
  projectId: string;
}

interface Props extends
  RouteComponentProps<ProjectParams>,
  WithUser,
  WithStyles<typeof styles> {}

interface State {
  annotations: Set<AnnotationRecord>;
  project?: ProjectData;
  error?: string;
  shareOpen: boolean;
}

const Project = withRouter(withStyles(styles)(
  class extends React.Component<Props, State> {

    state = {
      shareOpen: false,
      annotations: new Set()
    } as State;

    componentDidUpdate(prevProps: Props) {
      if (prevProps.user !== this.props.user) {
        this.load();
      }
    }

    componentDidMount() {
      this.load();
    }

    load() {
      const projectId = this.props.match.params.projectId;
      return ProjectsService.get(projectId)
        .then((project: ProjectData) => {
          this.setState({ project, error: undefined });
          return (ProjectsService.getAnnotations(projectId));
        })
        .then((annotations: AnnotationRecord[]) => {
          this.setState({ annotations: new Set(annotations) });
        })
        .catch((error: Error) => {
          this.setState({
            error: error.message,
            project: undefined,
            annotations: new Set()
          });
        });
    }

    render() {
      const { classes, ...otherProps } = this.props;

      const onVideoChange = this.load.bind(this);

      return (
        <div className={classes.root}>
          <div className={classes.videoContainer}>
            <div className={classes.video}>
              <Video
                project={this.state.project}
                annotations={this.state.annotations}
                onChange={onVideoChange}
                {...otherProps}
              />
            </div>
          </div>
          <div
            className={classes.content}
          >
            {this.state.project &&
              <Grid
                container={true}
                direction="row"
                alignItems="center"
                spacing={24}
              >
                <Grid item={true} xs={12} md={9}>
                  <div style={{ textAlign: 'left' }}>
                    <Typography gutterBottom={true} variant="display1">
                      {this.state.project.title}
                      &nbsp;
                      <i style={{ verticalAlign: 'middle' }} className="material-icons">edit</i>
                    </Typography>
                    <Typography gutterBottom={true} variant="subheading">
                      {this.state.project.description}
                    </Typography>
                  </div>
                </Grid>
                <Grid item={true} xs={12} md={3}>
                  <div style={{ textAlign: 'right' }}>
                    <Typography gutterBottom={true}>
                      {`public`}
                      <Switch checked={this.state.project.public} />
                    </Typography>
                    <Typography gutterBottom={true}>
                      {`collaboratif`}
                      <Switch checked={this.state.project.collaborative} />
                    </Typography>
                  </div>
                </Grid>
                {this.state.project.tags.length > 0 &&
                  <Grid item={true} xs={12}>
                    {this.state.project.tags
                      .map(tag =>
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          style={{
                            margin: 4,
                            float: 'right'
                          }}
                        />
                      )
                    }
                  </Grid>
                }
                <Grid item={true} xs={12}>
                  <Typography
                    align="left"
                    gutterBottom={true}
                    variant="display1"
                    color="primary"
                  >
                    {`Objectif`}
                  </Typography>
                  <Typography
                    align="justify"
                    gutterBottom={true}
                    variant="subheading"
                  >
                    {this.state.project.objective}
                  </Typography>
                  {this.state.project.assignments.length > 0 &&
                    <>
                      <Typography
                        align="left"
                        gutterBottom={true}
                        variant="display1"
                        color="primary"
                        style={{ paddingTop: 8 }}
                      >
                        {`Exercice`}
                      </Typography>
                      <Typography
                        align="left"
                        gutterBottom={true}
                        variant="subheading"
                      >
                        <ol style={{ paddingLeft: 16 }}>
                          {this.state.project.assignments.map((question, index) =>
                            <li key={index}>
                              {question}
                            </li>
                          )}
                        </ol>
                      </Typography>
                    </>
                  }
                </Grid>
                <Grid item={true}>
                  <Button
                    variant="raised"
                    color="primary"
                    size="small"
                    onClick={() => {
                      this.setState({ shareOpen: !this.state.shareOpen });
                    }}
                  >
                    <ShareIcon style={{ marginRight: 16 }} />
                    {`PARTAGER`}
                  </Button>
                  <ShareProject
                    isOpen={this.state.shareOpen}
                    project={this.state.project}
                    onClose={() => this.setState({shareOpen: false})}
                  />
                </Grid>
                <Grid item={true}>
                  <Typography>
                    <i style={{ verticalAlign: 'middle' }} className="material-icons">face</i>
                    &nbsp;
                      {`${this.state.project.views} participants`}
                  </Typography>
                </Grid>
                <Grid item={true}>
                  <Typography>
                    <i style={{ verticalAlign: 'middle' }} className="material-icons">edit</i>
                    &nbsp;
                      {`${this.state.project.shares} annotations`}
                  </Typography>
                </Grid>
              </Grid>
            }
          </div>
        </div>
      );
    }
  }
));

export default Project;