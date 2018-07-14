import { Action } from 'types/Action';
import ActionType from 'types/ActionType';

import TeachersService from 'services/TeachersService';
import {
  TeacherRecord,
  SignupErrors,
  NewTeacherData,
  SignupValidation,
} from '../../../../common/src/types/Teacher';
import { Dispatch } from 'redux';

export function openSignup():
Action<null> {
  return {
    type: ActionType.OPEN_SIGNUP,
  };
}

export function failSignup(errors: SignupErrors):
Action<SignupErrors> {
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

export function succeedSignup(record: TeacherRecord):
Action<TeacherRecord> {
  return {
    type: ActionType.SUCCEED_SIGNUP,
    payload: record
  };
}

export function failConfirmSignup(errors: SignupErrors):
Action<SignupErrors> {
  return {
    type: ActionType.FAIL_CONFIRM_SIGNUP,
    payload: errors
  };
}

export const doSignupThunk = (data: NewTeacherData) =>
  (dispatch: Dispatch) => {
    return TeachersService
      .signup(data)
      .then((result: SignupValidation) => {
        if (result.errors) {
          return dispatch(failSignup(result.errors));
        } else {
          return dispatch(openConfirmSignup(data.email));
        }
      });
  };