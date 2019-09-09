import { Credentials, SigninErrors, SigninResult } from '@celluloid/types';
import { Dispatch } from 'redux';
import UserService from 'services/UserService';
import { Action, ActionType, createEmptyAction } from 'types/ActionTypes';

import { triggerSigninLoading } from '.';
import { openConfirmSignup } from './SignupActions';
import { fetchCurrentUserThunk } from './UserActions';

export const openLogin = () => createEmptyAction(ActionType.OPEN_LOGIN);

export const succeedLogin = () => createEmptyAction(ActionType.SUCCEED_LOGIN);

export function failLogin(errors: SigninErrors):
  Action<SigninErrors> {
  return {
    type: ActionType.FAIL_LOGIN,
    payload: errors, error: true
  };
}

export const doLoginThunk = (credentials: Credentials) =>
  (dispatch: Dispatch) => {
    dispatch(triggerSigninLoading());
    return UserService
      .login(credentials)
      .then((result: SigninResult) => {
        if (!result.success) {
          if (result.errors.server === 'UserNotConfirmed') {
            return dispatch(openConfirmSignup(credentials));
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
