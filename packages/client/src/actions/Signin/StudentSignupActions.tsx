import { Action, ActionType } from 'types/ActionTypes';

import UserService from 'services/UserService';

import {
  StudentRecord,
  SigninErrors,
  SigninResult,
  StudentSignupData,
} from '@celluloid/commons';

import { Dispatch } from 'redux';
import { triggerSigninLoading } from '.';

export function openStudentSignup(): Action<null> {
  return {
    type: ActionType.OPEN_STUDENT_SIGNUP
  };
}

export function failStudentSignup(errors: SigninErrors) {
  return {
    type: ActionType.FAIL_SIGNUP,
    payload: errors
  };
}

export function succeedStudentSignup(): Action<StudentRecord> {
  return {
    type: ActionType.SUCCEED_SIGNUP
  };
}

export const doStudentSignupThunk = (data: StudentSignupData) =>
  (dispatch: Dispatch) => {
    dispatch(triggerSigninLoading());
    return UserService.studentSignup(data)
      .then((result: SigninResult) => {
        if (!result.success) {
          return dispatch(failStudentSignup(result.errors));
        } else {
          // doLoginThunk(credentials)(dispatch);
          return dispatch(succeedStudentSignup());
        }
      });
  };