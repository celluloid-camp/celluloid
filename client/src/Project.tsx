import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';
import Video from 'Video';

import { ProjectData } from '../../common/src/types/Project';

import { RouteComponentProps, withRouter } from 'react-router';

import ProjectsService from 'services/ProjectsService';
import { WithLogin } from 'types/Teacher';
import ShareProject from 'ShareProject';

import ShareIcon from '@material-ui/icons/Share';
import { WithStyles, withStyles } from '@material-ui/core/styles';

interface ProjectParams {
  projectId: string;
}

interface Props extends RouteComponentProps<ProjectParams>, WithLogin {
}

interface State {
  project?: ProjectData;
  error?: string;
  shareOpen: boolean;
}
const decorate = withStyles(({ palette, spacing }) => ({
  root: {
    minHeight: 'calc(100vh - 64px)'
  },
  videoContainer: {
    width: '100%',
    textAlign: 'center' as 'center',
    backgroundColor: 'black'
  },
  video: {
    maxWidth: 1024,
    margin: '0 auto',
  },
  paper: {
    padding: spacing.unit * 3,
    minHeight: 'calc(100% - 64px)',
    textAlign: 'center' as 'center',
    maxWidth: 1024,
    margin: '0 auto'
  }
}));

const Project = withRouter(decorate<Props>(
  class extends React.Component<
    Props & WithStyles<'root' |'videoContainer' | 'paper' | 'video'>,
    State
    > {

    state = { shareOpen: false } as State;

    componentWillReceiveProps(props: Props) {
      if (props.teacher !== this.props.teacher) {
        this.load();
      }
    }

    componentWillMount() {
      this.load();
    }

    load() {
      const projectId = this.props.match.params.projectId;

      ProjectsService.get(projectId)
        .then((project: ProjectData) => {
          this.setState({ project });
        })
        .catch(error => {
          this.setState({ error: error.message });
        });
    }

    render() {
      const { classes, ...otherProps } = this.props;

      return (
        <div className={classes.root}>
          <div className={classes.videoContainer}>
            <div className={classes.video}>
              <Video {...otherProps} />
            </div>
          </div>
          <Paper
            className={classes.paper}
          >
            {this.state.project ?
              <Grid
                container={true}
                direction="column"
                style={{ width: '100%' }}
              >
                <Grid item={true} xs={12}>
                  <Grid
                    container={true}
                    direction="row"
                    alignItems="center"
                  >
                    <Grid item={true} xs={9}>
                      <div style={{ textAlign: 'left' }}>
                        <Typography gutterBottom={true} variant="display1" style={{ color: '#272727' }}>
                          {this.state.project.title}
                          &nbsp;
                          <i style={{ verticalAlign: 'middle' }} className="material-icons">edit</i>
                        </Typography>
                        <Typography gutterBottom={true} variant="subheading" style={{ color: '#757575' }}>
                          {this.state.project.description}
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item={true} xs={3}>
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
                  </Grid>
                </Grid>

                <Grid item={true} xs={12}>
                  <Grid
                    container={true}
                    direction="row"
                    alignItems="flex-start"
                    justify="flex-start"
                  >
                    <Grid item={true} xs={1}>
                      <div style={{ textAlign: 'right' }}>
                        <Typography gutterBottom={true} variant="title" style={{ color: '#74AA55' }}>
                          {`Objectif`}
                        </Typography>
                        <Typography
                          gutterBottom={true}
                          variant="subheading"
                          style={{ paddingTop: 8, color: '#74AA55' }}
                        >
                          {`Exercice`}
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item={true} xs={9}>
                      <div style={{ textAlign: 'left' }}>
                        <Typography gutterBottom={true} variant="title" style={{ color: '#272727' }}>
                          {this.state.project.objective}
                        </Typography>
                        <ol style={{ paddingLeft: 14 }}>
                          {this.state.project.assignments.map((question, index) =>
                            <Typography gutterBottom={true} variant="subheading" key={index}>
                              <li>
                                {question}
                              </li>
                            </Typography>
                          )}
                        </ol>
                      </div>
                    </Grid>
                    <Grid item={true} xs={2}>
                      <div style={{ textAlign: 'right' }}>
                        {
                          this.state.project.tags
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
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item={true} xs={12} md={2}>
                  <Grid
                    container={true}
                    direction="column"
                    style={{ width: '100%', textAlign: 'left' }}
                  >
                    <Grid item={true} xs={12}>
                      <Button
                        variant="raised"
                        color="primary"
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
                        onClose={() => null}
                      />
                    </Grid>
                    <Grid item={true} xs={12}>
                      <Typography>
                        <i style={{ verticalAlign: 'middle' }} className="material-icons">face</i>
                        &nbsp;
                    {`vu par ${this.state.project.views} personnes`}
                      </Typography>
                    </Grid>
                    <Grid item={true} xs={12}>
                      <Typography>
                        <i style={{ verticalAlign: 'middle' }} className="material-icons">edit</i>
                        &nbsp;
                    {`annoté par ${this.state.project.shares} personnes`}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid> : this.state.error ?
                <div style={{ color: 'red', fontWeight: 'bold' }}>{this.state.error}</div> :
                <div>loading...</div>
            }
          </Paper>
        </div>
      );
    }
  }
));

export default Project;