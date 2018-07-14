import { Dispatch } from 'redux';
import TeachersService from 'services/TeachersService';
import { Action } from 'types/Action';
import ActionType from 'types/ActionType';

import { LoginErrors, LoginValidation, TeacherCredentials } from '../../../../common/src/types/Teacher';
import { fetchCurrentUserThunk } from './User';

export function openLogin(): Action<null> {
  return {
    type: ActionType.OPEN_LOGIN,
  };
}

export function succeedLogin(): Action<null> {
  return {
    type: ActionType.SUCCEED_LOGIN,
  };
}

export function failLogin(errors: LoginErrors):
  Action<LoginErrors> {
  return { type: ActionType.FAIL_LOGIN, payload: errors, error: true };
}

export const doLoginThunk = (credentials: TeacherCredentials) =>
  (dispatch: Dispatch) => {
    return TeachersService
      .login(credentials)
      .then((result: LoginValidation) => {
        if (result.errors) {
          // tslint:disable-next-line:no-console
          console.log(result.errors);
          return dispatch(failLogin(result.errors));
        } else {
          fetchCurrentUserThunk()(dispatch);
          return dispatch(succeedLogin());
        }
      });
  };