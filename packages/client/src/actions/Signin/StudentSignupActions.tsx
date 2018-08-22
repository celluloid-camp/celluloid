import { SigninErrors, SigninResult, StudentRecord, StudentSignupData } from '@celluloid/types';
import { Dispatch } from 'redux';
import UserService from 'services/UserService';
import { Action, ActionType } from 'types/ActionTypes';

import { doLoginThunk, triggerSigninLoading } from '.';

export function openStudentSignup(): Action<null> {
  return {
    type: ActionType.OPEN_STUDENT_SIGNUP
  };
}

export function failStudentSignup(errors: SigninErrors) {
  return {
    type: ActionType.FAIL_STUDENT_SIGNUP,
    payload: errors
  };
}

export function succeedStudentSignup(): Action<StudentRecord> {
  return {
    type: ActionType.SUCCEED_STUDENT_SIGNUP
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
          doLoginThunk({
            login: data.username,
            password: data.password
          })(dispatch);
          return dispatch(succeedStudentSignup());
        }
      }).catch(() => dispatch(failStudentSignup({server: 'RequestFailed'})));
  };