import { Action, ActionType } from 'types/ActionTypes';
import UserService from 'services/UserService';
import {
  SigninResult,
  SigninErrors,
  TeacherConfirmResetPasswordData
} from '@celluloid/types';
import { Dispatch } from 'redux';
import { triggerSigninLoading, doLoginThunk } from '.';

export function openResetPassword(): Action<null> {
  return {
    type: ActionType.OPEN_RESET_PASSWORD
  };
}

export function succeedResetPassword(): Action<null> {
  return {
    type: ActionType.SUCCEED_RESET_PASSWORD
  };
}

export function openConfirmResetPassword(
  email?: string
): Action<string | undefined> {
  return {
    type: ActionType.OPEN_CONFIRM_RESET_PASSWORD,
    payload: email
  };
}

export function failResetPassword(errors: SigninErrors): Action<SigninErrors> {
  return {
    type: ActionType.FAIL_RESET_PASSWORD,
    payload: errors
  };
}

export function failConfirmResetPassword(
  errors: SigninErrors
): Action<SigninErrors> {
  return {
    type: ActionType.FAIL_CONFIRM_RESET_PASSWORD,
    payload: errors
  };
}

export const doResetPasswordThunk = (email: string) => (dispatch: Dispatch) => {
  dispatch(triggerSigninLoading());
  return UserService.resetPassword(email)
    .then((result: SigninResult) => {
      if (!result.success) {
        return dispatch(failResetPassword(result.errors));
      } else {
        return dispatch(openConfirmResetPassword(email));
      }
    })
    .catch(() => {
      return dispatch(failResetPassword({ server: 'RequestFailed' }));
    });
};

export const doConfirmResetPasswordThunk = (
  data: TeacherConfirmResetPasswordData
) => (dispatch: Dispatch) => {
  dispatch(triggerSigninLoading());
  return UserService.confirmResetPassword(data)
    .then((result: SigninResult) => {
      if (!result.success) {
        return dispatch(failConfirmResetPassword(result.errors));
      } else {
        doLoginThunk({
          login: data.login,
          password: data.password
        })(dispatch);
        return dispatch(succeedResetPassword());
      }
    })
    .catch(() => {
      return dispatch(failResetPassword({ server: 'RequestFailed' }));
    });
};
