import { discardNewVideo } from 'actions/HomeActions';
import {
  ProjectCreateData,
  ProjectGraphRecord,
  ProjectShareData,
  ProjectUpdateData,
} from '@celluloid/types';
import { push } from 'connected-react-router';
import { Dispatch } from 'redux';
import ProjectService from 'services/ProjectService';
import {
  ActionType,
  AsyncAction,
  createAction,
  createEmptyAction,
  createErrorAction,
} from 'types/ActionTypes';

export const succeedListProjects = (projects: ProjectGraphRecord[]) =>
  createAction(ActionType.SUCCEED_LIST_PROJECTS, projects);

export const failListProjects = (error: string) =>
  createErrorAction(ActionType.FAIL_LIST_PROJECTS, error);

export const clearProject = () =>
  createEmptyAction(ActionType.CLEAR_PROJECT);

export const succeedLoadProject = (project: ProjectGraphRecord) =>
  createAction(ActionType.SUCCEED_LOAD_PROJECT, project);

export const failLoadProject = (error: string) =>
  createErrorAction(ActionType.FAIL_LOAD_PROJECT, error);

export const triggerUpsertProjectLoading = () =>
  createEmptyAction(ActionType.TRIGGER_UPSERT_PROJECT_LOADING);

export const succeedUpsertProject = (project: ProjectGraphRecord) =>
  createAction(ActionType.SUCCEED_UPSERT_PROJECT, project);

export const failUpsertProject = (error: string) =>
  createErrorAction(ActionType.FAIL_UPSERT_PROJECT, error);

export const openShareProject = () =>
  createEmptyAction(ActionType.OPEN_SHARE_PROJECT);

export const cancelShareProject = () =>
  createEmptyAction(ActionType.CANCEL_SHARE_PROJECT);

export const triggerShareProjectLoading = () =>
  createEmptyAction(ActionType.TRIGGER_SHARE_PROJECT_LOADING);

export const failShareProject = (error: string) =>
  createErrorAction(ActionType.FAIL_SHARE_PROJECT, error);

export const succeedShareProject = (project: ProjectGraphRecord) =>
  createAction(ActionType.SUCCEED_SHARE_PROJECT, project);

export const triggerSetProjectPublicLoading = () =>
  createEmptyAction(ActionType.TRIGGER_SET_PROJECT_PUBLIC_LOADING);

export const failSetProjectPublic = (error: string) =>
  createAction(ActionType.FAIL_SET_PROJECT_PUBLIC, error);

export const succeedSetProjectPublic = (project: ProjectGraphRecord) =>
  createAction(ActionType.SUCCEED_SET_PROJECT_PUBLIC, project);

export const triggerSetProjectCollaborativeLoading = () =>
  createEmptyAction(ActionType.TRIGGER_SET_PROJECT_COLLABORATIVE_LOADING);

export const failSetProjectCollaborative = (error: string) =>
  createErrorAction(ActionType.FAIL_SET_PROJECT_COLLABORATIVE, error);

export const succeedSetProjectCollaborative = (project: ProjectGraphRecord) =>
  createAction(ActionType.SUCCEED_SET_PROJECT_COLLABORATIVE, project);

export const triggerDeleteProjectLoading = () =>
  createEmptyAction(ActionType.TRIGGER_DELETE_PROJECT_LOADING);

export const failDeleteProject = (error: string) =>
  createErrorAction(ActionType.FAIL_DELETE_PROJECT, error);

export const succeedDeleteProject = (projectId: string) =>
  createAction(ActionType.SUCCEED_DELETE_PROJECT, projectId);

export const triggerUnshareProjectLoading = () =>
  createEmptyAction(ActionType.TRIGGER_UNSHARE_PROJECT_LOADING);

export const succeedUnshareProject = (error: string) =>
  createErrorAction(ActionType.SUCCEED_UNSHARE_PROJECT, error);

export const failUnshareProject = (project: ProjectGraphRecord) =>
  createAction(ActionType.FAIL_UNSHARE_PROJECT, project);

export const listProjectsThunk =
  () => (dispatch: Dispatch): AsyncAction<ProjectGraphRecord[], string> => {
    return ProjectService.list()
      .then(projectList => {
        return dispatch(succeedListProjects(projectList));
      })
      .catch(error => {
        return dispatch(failListProjects(error.message));
      });
  };

export const loadProjectThunk =
  (projectId: string) =>
    (dispatch: Dispatch) => {
      return ProjectService.get(projectId)
        .then(project => {
          return dispatch(succeedLoadProject(project));
        })
        .catch(error => {
          return dispatch(failLoadProject(error.message));
        });
    };

export const createProjectThunk =
  (data: ProjectCreateData) =>
    (dispatch: Dispatch): AsyncAction<ProjectGraphRecord, string> => {
      dispatch(triggerUpsertProjectLoading());
      return ProjectService.create(data)
        .then(project => {
          dispatch(push(`/projects/${project.id}`));
          dispatch(discardNewVideo());
          return dispatch(succeedUpsertProject(project));
        })
        .catch(error => {
          return dispatch(failUpsertProject(error.message));
        });
    };

export const updateProjectThunk =
  (projectId: string, data: ProjectUpdateData) =>
    (dispatch: Dispatch): AsyncAction<ProjectGraphRecord, string> => {
      dispatch(triggerUpsertProjectLoading());
      return ProjectService.update(projectId, data)
        .then(project => {
          return dispatch(succeedUpsertProject(project));
        })
        .catch(error => {
          return dispatch(failUpsertProject(error.message));
        });
    };

export const deleteProjectThunk =
  (projectId: string) =>
    (dispatch: Dispatch): AsyncAction<string, string> => {
      dispatch(triggerDeleteProjectLoading());
      return ProjectService.delete(projectId)
        .then(() => {
          dispatch(push('/'));
          return dispatch(succeedDeleteProject(projectId));
        })
        .catch(error => {
          return dispatch(failDeleteProject(error.message));
        });
    };

export const unshareProjectThunk =
  (projectId: string) =>
    (dispatch: Dispatch): AsyncAction<ProjectGraphRecord, string> => {
      dispatch(triggerUnshareProjectLoading());
      return ProjectService.unshare(projectId)
        .then(project => {
          return dispatch(succeedUnshareProject(project));
        })
        .catch(error => {
          return dispatch(failUnshareProject(error.message));
        });
    };

export const shareProjectThunk =
  (projectId: string, data: ProjectShareData) =>
    (dispatch: Dispatch): AsyncAction<ProjectGraphRecord, string> => {
      dispatch(triggerShareProjectLoading());
      return ProjectService.share(projectId, data)
        .then(project => {
          dispatch(succeedLoadProject(project));
          return dispatch(succeedShareProject(project));
        })
        .catch(error => {
          return dispatch(failShareProject(error.message));
        });
    };

export const setProjectCollaborativeThunk =
  (projectId: string, collaborative: boolean) =>
    (dispatch: Dispatch): AsyncAction<ProjectGraphRecord, string> => {
      dispatch(triggerSetProjectCollaborativeLoading());
      return ProjectService
        .setAttribute(projectId, 'collaborative', collaborative)
        .then(project => {
          return dispatch(succeedSetProjectCollaborative(project));
        })
        .catch(error => {
          return dispatch(failSetProjectCollaborative(error.message));
        });
    };

export const setProjectPublicThunk =
  (projectId: string, _public: boolean) =>
    (dispatch: Dispatch): AsyncAction<ProjectGraphRecord, string> => {
      dispatch(triggerSetProjectPublicLoading());
      return ProjectService
        .setAttribute(projectId, 'public', _public)
        .then(project => {
          return dispatch(succeedSetProjectPublic(project));
        })
        .catch(error => {
          return dispatch(failSetProjectPublic(error.message));
        });
    };
