
import * as React from 'react';

import { ProjectData } from './types/Project';
import { RouteComponentProps } from 'react-router';

import ProjectsService from './services/Projects';

import YouTube from 'react-youtube';

import { withStyles } from 'material-ui/styles';

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

const Video = decorate<{}>(
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
      const classes = this.props.classes;
      return (
        <div className={classes.videoContainer}>
          {this.state.project ?
            <YouTube
              videoId={this.state.project.videoId}
              opts={{
                playerVars: { modestbranding: 1 }
              }}
              className={classes.videoIframe}
            />
            : <div/>
          }
        </div>
      );
    }
  }
);

export default Video;