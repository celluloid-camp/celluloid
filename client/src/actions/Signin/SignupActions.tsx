import { Action } from 'types/Action';
import ActionType from 'types/ActionType';

import TeachersService from 'services/TeachersService';
import {
  TeacherRecord,
  SigninErrors,
  SigninValidation,
  TeacherSignupData,
  TeacherConfirmData,
} from '../../../../common/src/types/TeacherTypes';
import { Dispatch } from 'redux';
import { triggerSigninLoading } from 'actions/Signin';

export function openSignup():
  Action<null> {
  return {
    type: ActionType.OPEN_SIGNUP,
  };
}

export function failSignup(errors: SigninErrors):
  Action<SigninErrors> {
  return {
    type: ActionType.FAIL_SIGNUP,
    payload: errors
  };
}

export function openConfirmSignup(email?: string):
  Action<string> {
  return {
    type: ActionType.OPEN_CONFIRM_SIGNUP,
    payload: email
  };
}

export function succeedSignup():
  Action<TeacherRecord> {
  return {
    type: ActionType.SUCCEED_SIGNUP,
  };
}

export function failConfirmSignup(errors: SigninErrors):
  Action<SigninErrors> {
  return {
    type: ActionType.FAIL_CONFIRM_SIGNUP,
    payload: errors
  };
}

export const doSignupThunk = (data: TeacherSignupData) =>
  (dispatch: Dispatch) => {
    dispatch(triggerSigninLoading());
    return TeachersService
      .signup(data)
      .then((result: SigninValidation) => {
        if (!result.success) {
          return dispatch(failSignup(result.errors));
        } else {
          return dispatch(openConfirmSignup(data.email));
        }
      })
      .catch(() => {
        return dispatch(failSignup({ server: 'RequestFailed' }));
      });
  };

export const doConfirmSignupThunk = (data: TeacherConfirmData) =>
  (dispatch: Dispatch) => {
    dispatch(triggerSigninLoading());
    return TeachersService
      .confirmSignup(data)
      .then((result: SigninValidation) => {
        if (result.errors) {
          return dispatch(failConfirmSignup(result.errors));
        } else {
          return dispatch(succeedSignup());
        }
      })
      .catch(() => {
        return dispatch(failConfirmSignup({ server: 'RequestFailed' }));
      });
  };

export const doResendCodeThunk = (email: string) =>
  (dispatch: Dispatch) => {
    dispatch(triggerSigninLoading());
    return TeachersService
      .resendCode(email)
      .then((result: SigninValidation) => {
        if (result.errors) {
          return dispatch(failConfirmSignup(result.errors));
        } else {
          return dispatch(succeedSignup());
        }
      })
      .catch(() => {
        return dispatch(failConfirmSignup({ server: 'RequestFailed' }));
      });
  };