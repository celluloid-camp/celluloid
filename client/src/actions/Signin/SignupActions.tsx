import { Action } from 'types/Action';
import ActionType from 'types/ActionType';

import TeachersService from 'services/TeachersService';
import {
  TeacherRecord,
  SigninErrors,
  SigninResult,
  TeacherSignupData,
  TeacherConfirmData,
  TeacherCredentials
} from '../../../../common/src/types/TeacherTypes';
import { Dispatch } from 'redux';
import { triggerSigninLoading, doLoginThunk } from '.';

export function openSignup(): Action<null> {
  return {
    type: ActionType.OPEN_SIGNUP
  };
}

export function failSignup(errors: SigninErrors): Action<SigninErrors> {
  return {
    type: ActionType.FAIL_SIGNUP,
    payload: errors
  };
}

export function openConfirmSignup(
  credentials?: TeacherCredentials
): Action<TeacherCredentials> {
  return {
    type: ActionType.OPEN_CONFIRM_SIGNUP,
    payload: credentials
  };
}

export function succeedSignup(): Action<TeacherRecord> {
  return {
    type: ActionType.SUCCEED_SIGNUP
  };
}

export function failConfirmSignup(errors: SigninErrors): Action<SigninErrors> {
  return {
    type: ActionType.FAIL_CONFIRM_SIGNUP,
    payload: errors
  };
}

export const doSignupThunk = (data: TeacherSignupData) => (
  dispatch: Dispatch
) => {
  dispatch(triggerSigninLoading());
  return TeachersService.signup(data)
    .then((result: SigninResult) => {
      if (!result.success) {
        return dispatch(failSignup(result.errors));
      } else {
        return dispatch(
          openConfirmSignup({
            email: data.email,
            password: data.password
          })
        );
      }
    })
    .catch(() => {
      return dispatch(failSignup({ server: 'RequestFailed' }));
    });
};

export const doConfirmSignupThunk = (
  data: TeacherConfirmData,
  credentials?: TeacherCredentials
) => (dispatch: Dispatch) => {
  dispatch(triggerSigninLoading());
  return TeachersService.confirmSignup(data)
    .then((result: SigninResult) => {
      if (!result.success) {
        return dispatch(failConfirmSignup(result.errors));
      } else {
        if (credentials) {
          doLoginThunk(credentials)(dispatch);
          return;
        } else {
          return dispatch(succeedSignup());
        }
      }
    })
    .catch(() => {
      return dispatch(failConfirmSignup({ server: 'RequestFailed' }));
    });
};

export const doResendCodeThunk = (email: string) => (dispatch: Dispatch) => {
  dispatch(triggerSigninLoading());
  return TeachersService.resendCode(email)
    .then((result: SigninResult) => {
      if (!result.success) {
        return dispatch(failConfirmSignup(result.errors));
      } else {
        return dispatch(succeedSignup());
      }
    })
    .catch(() => {
      return dispatch(failConfirmSignup({ server: 'RequestFailed' }));
    });
};
