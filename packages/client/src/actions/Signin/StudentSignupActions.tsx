import {
  SigninErrors,
  SigninResult,
  StudentSignupData,
} from "@celluloid/types";
import { Dispatch } from "redux";

import UserService from "~services/UserService";
import {
  ActionType,
  createEmptyAction,
  createErrorAction,
  EmptyAction,
} from "~types/ActionTypes";

import { doLoginThunk, triggerSigninLoading } from ".";

export const openStudentSignup = (): EmptyAction =>
  createEmptyAction(ActionType.OPEN_STUDENT_SIGNUP);

export const failStudentSignup = (errors: SigninErrors) =>
  createErrorAction(ActionType.FAIL_STUDENT_SIGNUP, errors);

export const succeedStudentSignup = (): EmptyAction =>
  createEmptyAction(ActionType.SUCCEED_STUDENT_SIGNUP);

export const doStudentSignupThunk =
  (data: StudentSignupData) => (dispatch: Dispatch) => {
    dispatch(triggerSigninLoading());
    return UserService.studentSignup(data)
      .then((result: SigninResult) => {
        if (!result.success) {
          return dispatch(failStudentSignup(result.errors));
        } else {
          doLoginThunk({
            login: data.username,
            password: data.password,
          })(dispatch);
          return dispatch(succeedStudentSignup());
        }
      })
      .catch(() => dispatch(failStudentSignup({ server: "RequestFailed" })));
  };
