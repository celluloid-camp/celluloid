import { Action, ActionType } from 'types/ActionTypes';
import { TeacherRecord } from '@celluloid/commons';
import UserService from 'services/UserService';
import { Dispatch } from 'redux';

export function failCurrentUser(error: string):
  Action<string> {
  return {
    type: ActionType.FAIL_CURRENT_USER,
    payload: error,
    error: true,
  };
}

export function succeedCurrentUser(user?: TeacherRecord):
  Action<TeacherRecord> {
  return {
    type: ActionType.SUCCEED_CURRENT_USER,
    payload: user
  };
}

export function failLogout(error: string):
  Action<string> {
  return {
    type: ActionType.FAIL_LOGOUT,
    payload: error,
    error: true
  };
}

export const fetchCurrentUserThunk = () => (dispatch: Dispatch) => {
  return UserService
    .me()
    .then(result => {
      if (result.teacher) {
        return dispatch(succeedCurrentUser(result.teacher));
      } else {
        return dispatch(succeedCurrentUser());
      }
    })
    .catch(error => {
      return dispatch(failCurrentUser(error.message));
    });
};

export const doLogoutThunk = () => (dispatch: Dispatch) => {
  return UserService
    .logout()
    .then(() => {
      return dispatch(succeedCurrentUser());
    })
    .catch(error => {
      return dispatch(failLogout(error.message));
    });
};
