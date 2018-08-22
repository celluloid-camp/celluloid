import { ProjectGraphRecord, UserRecord } from '@celluloid/types';
import {
  deleteProjectThunk,
  openShareProject,
  setProjectCollaborativeThunk,
  setProjectPublicThunk,
  unshareProjectThunk
} from 'actions/ProjectActions';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AsyncAction, EmptyAction } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';

import SideBarComponent from './SideBarComponent';

interface Props {
  user?: UserRecord;
  project: ProjectGraphRecord;
  setPublicLoading: boolean;
  setCollaborativeLoading: boolean;
  unshareLoading: boolean;
  deleteLoading: boolean;
  setPublicError?: string;
  setCollaborativeError?: string;
  unshareError?: string;
  deleteError?: string;
  onClickSetPublic(projectId: string, value: boolean):
    AsyncAction<ProjectGraphRecord, string>;
  onClickSetCollaborative(projectId: string, value: boolean):
    AsyncAction<ProjectGraphRecord, string>;
  openShareDialog(): EmptyAction;
  unshareProject(projectId: string):
    AsyncAction<ProjectGraphRecord, string>;
  onClickDelete(projectId: string): AsyncAction<null, string>;
}

const mapStateToProps = (state: AppState) => ({
  setPublicLoading: state.projectPage.details.setPublicLoading,
  setCollaborativeLoading: state.projectPage.details.setCollaborativeLoading,
  unshareLoading: state.projectPage.details.unshareLoading,
  deleteLoading: state.projectPage.details.deleteLoading,
  setPublicError: state.projectPage.details.setPublicError,
  setCollaborativeError: state.projectPage.details.setCollaborativeError,
  unshareError: state.projectPage.details.unshareError,
  deleteError: state.projectPage.details.deleteError,
  user: state.user
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  openShareDialog: () => dispatch(openShareProject()),
  unshareProject: (projectId: string) =>
    unshareProjectThunk(projectId)(dispatch),
  onClickDelete: (projectId: string) =>
    deleteProjectThunk(projectId)(dispatch),
  onClickSetPublic: (projectId: string, value: boolean) =>
    setProjectPublicThunk(projectId, value)(dispatch),
  onClickSetCollaborative: (projectId: string, value: boolean) =>
    setProjectCollaborativeThunk(projectId, value)(dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(class extends React.Component<Props> {
  render() {
    const {
      project,
      openShareDialog,
      unshareProject
    } = this.props;

    const teachers = Array.from(project.members).filter(member =>
      member.role === 'Teacher' || member.role === 'Admin'
    ).map(teacher => ({ subtitle: 'Contributeur', ...teacher }));

    const students = Array.from(project.members).filter(member =>
      member.role === 'Student'
    );

    const content = new Set([
      { subtitle: 'Créateur', ...project.user },
      ...teachers,
      ...students
    ]);

    const onClickShare = () => {
      if (project.shared) {
        unshareProject(project.id);
      } else {
        openShareDialog();
      }
    };

    return (
      <SideBarComponent
        {...this.props}
        onClickShare={onClickShare}
        members={content}
      />
    );
  }
});