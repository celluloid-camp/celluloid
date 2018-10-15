import { listProjectsThunk } from '@celluloid/client/src/actions/ProjectActions';
import { ProjectGraphRecord, TagData, UserRecord } from '@celluloid/types';
import Grid from '@material-ui/core/Grid';
import Grow from '@material-ui/core/Grow';
import { listTagsThunk } from 'actions/TagActions';
import * as R from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { Dispatch } from 'redux';
import { AsyncAction } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';

import ProjectThumbnail from './ProjectThumbnail';

interface Props {
  user?: UserRecord;
  projects: ProjectGraphRecord[];
  tags: TagData[];
  loadProjects(): AsyncAction<ProjectGraphRecord[], string>;
  loadTags(): AsyncAction<TagData[], string>;
}

const mapStateToProps = (state: AppState) => ({
  user: state.user,
  projects: state.home.projects,
  tags: state.tags
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadTags: () => listTagsThunk()(dispatch),
  loadProjects: () => listProjectsThunk()(dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(
  class extends React.Component<Props> {
    load() {
      this.props.loadProjects();
      this.props.loadTags();
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
      const { projects } = this.props;

      const sort = R.sortWith([
        R.descend(R.prop('publishedAt'))
      ]);

      const sorted = sort(projects);

      return (
        <>
          {/* <Toolbar>
            <TextField
              variant="outlined"
              placeholder="Rechercher..."
            />
          </Toolbar> */}
          <div style={{ padding: 20 }}>
            <Grid container={true} spacing={40} direction="row">
              <TransitionGroup component={null} appear={true}>
                {sorted.map((project: ProjectGraphRecord) =>
                  <Grow in={true} appear={true} key={project.id}>
                    <ProjectThumbnail {...project} />
                  </Grow>
                )}
              </TransitionGroup>
            </Grid>
          </div>
        </>
      );
    }
  }
);