import { ActionType } from '@celluloid/client/src/types/ActionTypes';
import { AnyAction } from 'redux';
import { HomeState } from 'types/StateTypes';

const initialState = {
  errors: {
    video: undefined,
    projects: undefined,
  },
  projects: [],
  video: undefined
} as HomeState;

export default (state = initialState, {type, payload}: AnyAction):
  HomeState => {
    switch (type) {
      case ActionType.FAIL_LOAD_VIDEO:
        return {
          ...state,
          errors: {
            ...state.errors,
            video: payload
          },
          video: undefined,
        };
      case ActionType.SUCCEED_LOAD_VIDEO:
        return {
          ...state,
          errors: {
            ...state.errors,
            video: undefined
          },
          video: payload
        };
      case ActionType.SUCCEED_LIST_PROJECTS:
        return {
          ...state,
          errors: {
            ...state.errors,
            projects: undefined,
          },
          projects: payload
        };
      case ActionType.FAIL_LIST_PROJECTS:
        return {
          ...state,
          errors: {
            ...state.errors,
            projects: payload
          },
          projects: []
        };
      default:
        return state;
    }
  };