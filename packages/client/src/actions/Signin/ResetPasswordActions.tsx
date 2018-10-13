import { SigninErrors, SigninResult, TeacherConfirmResetPasswordData } from '@celluloid/types';
import { Dispatch } from 'redux';
import UserService from 'services/UserService';
import { ActionType, createAction, createEmptyAction, createErrorAction } from 'types/ActionTypes';

import { doLoginThunk, triggerSigninLoading } from '.';

export const openResetPassword = () => createEmptyAction(ActionType.OPEN_RESET_PASSWORD);

export const succeedResetPassword = () => createEmptyAction(ActionType.SUCCEED_RESET_PASSWORD);

export const openConfirmResetPassword = (email: string) =>
  createAction(ActionType.OPEN_CONFIRM_RESET_PASSWORD, email);

export const failResetPassword = (errors: SigninErrors) =>
  createErrorAction(ActionType.FAIL_RESET_PASSWORD, errors);

export const failConfirmResetPassword = (errors: SigninErrors) =>
  createErrorAction(ActionType.FAIL_CONFIRM_RESET_PASSWORD, errors);

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
