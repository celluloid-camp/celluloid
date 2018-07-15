import { Dispatch } from 'redux';
import TeachersService from 'services/TeachersService';
import { Action } from 'types/Action';
import ActionType from 'types/ActionType';

import {
  SigninErrors,
  SigninValidation,
  TeacherCredentials
} from '../../../../common/src/types/TeacherTypes';
import { fetchCurrentUserThunk } from './UserActions';
import { openConfirmSignup } from './SignupActions';
import { triggerSigninLoading } from '.';

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

export function failLogin(errors: SigninErrors):
  Action<SigninErrors> {
  return { type: ActionType.FAIL_LOGIN, payload: errors, error: true };
}

export const doLoginThunk = (credentials: TeacherCredentials) =>
  (dispatch: Dispatch) => {
    dispatch(triggerSigninLoading());
    return TeachersService
      .login(credentials)
      .then((result: SigninValidation) => {
        if (result.errors) {
          if (result.errors.server === 'UserNotConfirmed') {
            return dispatch(openConfirmSignup(credentials.email));
          } else {
            return dispatch(failLogin(result.errors));
          }
        } else {
          fetchCurrentUserThunk()(dispatch);
          return dispatch(succeedLogin());
        }
      })
      .catch(() => {
        return dispatch(failLogin({ server: 'RequestFailed' }));
      });
  };