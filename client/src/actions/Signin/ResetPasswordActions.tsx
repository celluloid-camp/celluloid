import { Action } from 'types/Action';
import ActionType from 'types/ActionType';

import TeachersService from 'services/TeachersService';
import {
  SigninResult,
  SigninErrors,
  TeacherConfirmResetPasswordData
} from '../../../../common/src/types/TeacherTypes';
import { Dispatch } from 'redux';
import { triggerSigninLoading, doLoginThunk } from 'actions/Signin';

export function openResetPassword(): Action<null> {
  return {
    type: ActionType.OPEN_RESET_PASSWORD
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
  return TeachersService.resetPassword(email)
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
  return TeachersService.confirmResetPassword(data)
    .then((result: SigninResult) => {
      if (!result.success) {
        return dispatch(failConfirmResetPassword(result.errors));
      } else {
        doLoginThunk({
          email: data.email,
          password: data.password
        })(dispatch);
        return;
      }
    })
    .catch(() => {
      return dispatch(failResetPassword({ server: 'RequestFailed' }));
    });
};
