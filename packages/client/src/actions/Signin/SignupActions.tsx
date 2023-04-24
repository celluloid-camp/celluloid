import {
  Credentials,
  SigninErrors,
  SigninResult,
  TeacherConfirmData,
  TeacherSignupData,
} from "@celluloid/types";
import { Dispatch } from "redux";

import UserService from "~services/UserService";
import {
  ActionType,
  createEmptyAction,
  createErrorAction,
  createOptionalAction,
} from "~types/ActionTypes";

import { doLoginThunk, triggerSigninLoading } from ".";

export const openSignup = () => createEmptyAction(ActionType.OPEN_SIGNUP);

export const failSignup = (errors: SigninErrors) =>
  createErrorAction(ActionType.FAIL_SIGNUP, errors);

export const openConfirmSignup = (credentials?: Credentials) =>
  createOptionalAction(ActionType.OPEN_CONFIRM_SIGNUP, credentials);

export const succeedSignup = () => createEmptyAction(ActionType.SUCCEED_SIGNUP);

export const failConfirmSignup = (errors: SigninErrors) =>
  createErrorAction(ActionType.FAIL_CONFIRM_SIGNUP, errors);

export const doSignupThunk =
  (data: TeacherSignupData) => (dispatch: Dispatch) => {
    dispatch(triggerSigninLoading());
    return UserService.signup(data)
      .then((result: SigninResult) => {
        if (!result.success) {
          return dispatch(failSignup(result.errors));
        } else {
          return dispatch(
            openConfirmSignup({
              login: data.email,
              password: data.password,
            })
          );
        }
      })
      .catch(() => dispatch(failSignup({ server: "RequestFailed" })));
  };

export const doConfirmSignupThunk =
  (data: TeacherConfirmData, credentials?: Credentials) =>
  (dispatch: Dispatch) => {
    dispatch(triggerSigninLoading());
    return UserService.confirmSignup(data)
      .then((result: SigninResult) => {
        if (!result.success) {
          return dispatch(failConfirmSignup(result.errors));
        } else {
          if (credentials) {
            doLoginThunk(credentials)(dispatch);
          }
          return dispatch(succeedSignup());
        }
      })
      .catch(() => {
        return dispatch(failConfirmSignup({ server: "RequestFailed" }));
      });
  };

export const doResendCodeThunk = (email: string) => (dispatch: Dispatch) => {
  dispatch(triggerSigninLoading());
  return UserService.resendCode(email)
    .then((result: SigninResult) => {
      if (!result.success) {
        return dispatch(failConfirmSignup(result.errors));
      } else {
        return dispatch(succeedSignup());
      }
    })
    .catch(() => {
      return dispatch(failConfirmSignup({ server: "RequestFailed" }));
    });
};
