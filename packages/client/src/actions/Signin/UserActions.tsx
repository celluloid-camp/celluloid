import { TeacherRecord } from "@celluloid/types";
import { Dispatch } from "redux";

import UserService from "~services/UserService";
import {
  Action,
  ActionType,
  createErrorAction,
  createOptionalAction,
} from "~types/ActionTypes";

export const failCurrentUser = (error: string): Action<string> =>
  createErrorAction(ActionType.FAIL_GET_CURRENT_USER, error);

export const succeedCurrentUser = (
  user?: TeacherRecord
): Action<TeacherRecord> =>
  createOptionalAction(ActionType.SUCCEED_GET_CURRENT_USER, user);

export const failLogout = (error: string): Action<string> =>
  createOptionalAction(ActionType.FAIL_LOGOUT, error);

export const fetchCurrentUserThunk = () => (dispatch: Dispatch) => {
  return UserService.me()
    .then((result) => {
      if (result.teacher) {
        return dispatch(succeedCurrentUser(result.teacher));
      } else {
        return dispatch(succeedCurrentUser());
      }
    })
    .catch((error) => {
      return dispatch(failCurrentUser(error.message));
    });
};

export const doLogoutThunk = () => (dispatch: Dispatch) => {
  console.log("doLogoutThunk");
  return UserService.logout()
    .then(() => {
      console.log("logout result");
      return dispatch(succeedCurrentUser());
    })
    .catch((error) => {
      return dispatch(failLogout(error.message));
    });
};
