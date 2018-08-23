import { AnnotationRecord, ProjectGraphRecord, UserRecord } from '@celluloid/types';
import { clearProject, loadProjectThunk } from 'actions/ProjectActions';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
import AnnotationService from 'services/AnnotationService';
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

interface State {
  annotations: Set<AnnotationRecord>;
  error?: string;
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
  )(class extends React.Component<Props, State> {

    state = {
      annotations: new Set(),
    } as State;

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
      AnnotationService.list(projectId)
        .then(annotations => {
          this.setState({
            annotations,
            error: undefined
          });
        })
        .catch((error: Error) => {
          this.setState({
            error: error.message,
            annotations: new Set(),
          });
        });
    }

    render() {
      const { annotations } = this.state;
      const { project } = this.props;
      const load = this.load.bind(this);

      return (
        <ProjectComponent
          project={project}
          annotations={annotations}
          onVideoChange={load}
        />
      );
    }
  })
);