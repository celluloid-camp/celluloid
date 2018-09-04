import { ProjectGraphRecord, UserRecord } from '@celluloid/types';
import { clearProject, loadProjectThunk } from 'actions/ProjectActions';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
import { AsyncAction, EmptyAction } from 'types/ActionTypes';
import { ProjectRouteParams } from 'types/ProjectTypes';
import { AppState } from 'types/StateTypes';

import ProjectComponent from './ProjectComponent';

interface Props extends
  RouteComponentProps<ProjectRouteParams> {
  user?: UserRecord;
  project?: ProjectGraphRecord;
  error?: string;
  loadProject(projectId: string):
    AsyncAction<ProjectGraphRecord, string>;
  clearProject(): EmptyAction;
}

const mapStateToProps = (state: AppState) => ({
  user: state.user,
  project: state.project.details.project,
  error: state.project.details.error
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadProject: (projectId: string) =>
    loadProjectThunk(projectId)(dispatch),
  clearProject: () =>
    dispatch(clearProject())
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(class extends React.Component<Props> {

    componentDidUpdate(prevProps: Props) {
      if (prevProps.user !== this.props.user) {
        this.load();
      }
    }

    componentDidMount() {
      this.load();
    }

    componentWillUnmount() {
      this.props.clearProject();
    }

    load() {
      const projectId = this.props.match.params.projectId;
      this.props.loadProject(projectId);
    }

    render() {
      const { project } = this.props;
      const load = this.load.bind(this);

      return (
        <ProjectComponent
          project={project}
          onVideoChange={load}
        />
      );
    }
  })
);