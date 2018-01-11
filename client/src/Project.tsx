import * as React from 'react';

import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Switch from 'material-ui/Switch';
import Chip from 'material-ui/Chip';
import Video from './Video';

import { withStyles } from 'material-ui/styles';

import { ProjectData } from './types/Project';

import { RouteComponentProps } from 'react-router';

import ProjectsService from './services/Projects';

const decorate = withStyles(({ palette, spacing }) => ({
  videoContainer: {
    border: '2px solid #757575',
    position: 'relative' as 'relative',
    height: 0,
    width: '100%',
    paddingBottom: '56.25%'
  },
  videoIframe: {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }
}));

interface ProjectParams {
  projectId: string;
}

interface Props extends RouteComponentProps<ProjectParams> {
  classes: {
    videoContainer: string;
    videoIframe: string;
  };
}

interface State {
  project?: ProjectData;
  error?: string;
}

const Project = decorate<{}>(
  class extends React.Component<Props, State> {

    constructor(props: Props) {
      super(props);
      this.state = {};
    }

    componentWillMount() {
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
      const props = this.props;

      return (
        <Paper
          elevation={0}
          style={{
            padding: 48,
            textAlign: 'center',
            maxWidth: 1300,
            margin: '0 auto'
          }}
        >
          {this.state.project ?
            <Grid
              container={true}
              direction="row"
              justify="center"
              alignContent="center"
            >
              <Grid
                item={true}
                xs={12}
                md={10}
              >
                <Grid
                  container={true}
                  direction="column"
                  style={{ width: '100%' }}
                >
                  <Grid
                    item={true}
                    xs={12}
                    style={{
                      width: '100%',
                      textAlign: 'right',
                    }}
                  > <Video {...props} />
                  </Grid>

                  <Grid item={true} xs={12}>
                    <Grid
                      container={true}
                      direction="row"
                      alignItems="center"
                    >
                      <Grid item={true} xs={9}>
                        <div style={{ textAlign: 'left' }}>
                          <Typography gutterBottom={true} type="display1" style={{ color: '#272727' }}>
                            {this.state.project.title}
                            &nbsp;
                          <i style={{ verticalAlign: 'middle' }} className="material-icons">edit</i>
                          </Typography>
                          <Typography gutterBottom={true} type="subheading" style={{ color: '#757575' }}>
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
                          <Typography gutterBottom={true} type="title" style={{ color: '#74AA55' }}>
                            {`Objectif`}
                          </Typography>
                          <Typography
                            gutterBottom={true}
                            type="subheading"
                            style={{ paddingTop: 8, color: '#74AA55' }}
                          >
                            {`Exercice`}
                          </Typography>
                        </div>
                      </Grid>
                      <Grid item={true} xs={9}>
                        <div style={{ textAlign: 'left' }}>
                          <Typography gutterBottom={true} type="title" style={{ color: '#272727' }}>
                            {this.state.project.objective}
                          </Typography>
                          <ol style={{ paddingLeft: 14 }}>
                            {this.state.project.assignments.map((question, index) =>
                              <Typography gutterBottom={true} type="subheading" key={index}>
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
                </Grid>
              </Grid>
              <Grid item={true} xs={12} md={2}>
                <Grid
                  container={true}
                  direction="column"
                  style={{ width: '100%', textAlign: 'left' }}
                >
                  <Grid item={true} xs={12}>
                    <Button raised={true} color="primary" style={{ color: 'white', borderRadius: 24 }}>
                      <i style={{ verticalAlign: 'middle' }} className="material-icons">share</i>
                      &nbsp;
                    {`PARTAGER`}
                    </Button>
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
            </Grid> :
            <div>loading...</div>
          }
        </Paper>
      );
    }
  }
);

export default Project;