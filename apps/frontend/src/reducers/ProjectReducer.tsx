import { AnyAction } from "redux";

import { ActionType } from "~types/ActionTypes";
import { ComponentStatus, ProjectDetailsState } from "~types/StateTypes";

const initialState = {
  status: ComponentStatus.LOADING,
  error: undefined,
  project: undefined,
  deleteLoading: false,
  setPublicLoading: false,
  setCollaborativeLoading: false,
  deleteError: undefined,
  setPublicError: undefined,
  setCollaborativeError: undefined,
  unshareError: undefined,
  unshareLoading: false,
} as ProjectDetailsState;

export default (
  state = initialState,
  { type, payload }: AnyAction
): ProjectDetailsState => {
  switch (type) {
    case ActionType.CLEAR_PROJECT:
      return initialState;
    case ActionType.FAIL_LOAD_PROJECT:
      return {
        ...initialState,
        status: ComponentStatus.ERROR,
        project: undefined,
        error: payload,
      };
    case ActionType.SUCCEED_LOAD_PROJECT:
      return {
        ...state,
        status: ComponentStatus.READY,
        project: payload,
        error: undefined,
      };
    case ActionType.TRIGGER_DELETE_PROJECT_LOADING:
      return {
        ...state,
        deleteLoading: true,
      };
    case ActionType.FAIL_DELETE_PROJECT:
      return {
        ...state,
        deleteLoading: false,
        deleteError: payload,
      };
    case ActionType.SUCCEED_DELETE_PROJECT:
      return initialState;
    case ActionType.TRIGGER_SET_PROJECT_PUBLIC_LOADING:
      return {
        ...state,
        setPublicLoading: true,
      };
    case ActionType.FAIL_SET_PROJECT_PUBLIC:
      return {
        ...state,
        setPublicLoading: false,
        setPublicError: payload,
      };
    case ActionType.SUCCEED_SET_PROJECT_PUBLIC:
      return {
        ...state,
        setPublicLoading: false,
        setPublicError: undefined,
        project: payload,
      };
    case ActionType.TRIGGER_SET_PROJECT_COLLABORATIVE_LOADING:
      return {
        ...state,
        setCollaborativeLoading: true,
      };
    case ActionType.FAIL_SET_PROJECT_COLLABORATIVE:
      return {
        ...state,
        setCollaborativeLoading: false,
        setCollaborativeError: payload,
      };
    case ActionType.SUCCEED_SET_PROJECT_COLLABORATIVE:
      return {
        ...state,
        setCollaborativeLoading: false,
        setCollaborativeError: undefined,
        project: payload,
      };
    case ActionType.TRIGGER_UNSHARE_PROJECT_LOADING:
      return {
        ...state,
        unshareLoading: true,
      };
    case ActionType.FAIL_UNSHARE_PROJECT:
      return {
        ...state,
        unshareLoading: false,
        unshareError: payload,
      };
    case ActionType.SUCCEED_UNSHARE_PROJECT:
      return {
        ...state,
        unshareLoading: false,
        unshareError: undefined,
        project: payload,
      };
    default:
      return state;
  }
};
