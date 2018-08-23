import { ActionType } from '@celluloid/client/src/types/ActionTypes';
import { AnyAction } from 'redux';
import { ComponentStatus, HomeState } from 'types/StateTypes';

const initialState = {
  status: ComponentStatus.LOADING,
  error: undefined,
  projects: new Set()
} as HomeState;

export default (state = initialState, {type, payload}: AnyAction):
  HomeState => {
    switch (type) {
      case ActionType.SUCCEED_LIST_PROJECTS:
        return {
          status: ComponentStatus.READY,
          error: undefined,
          projects: new Set(payload)
        };
      case ActionType.FAIL_LIST_PROJECTS:
        return {
          status: ComponentStatus.ERROR,
          error: payload,
          projects: new Set()
        };
      default:
        return state;
    }
  };