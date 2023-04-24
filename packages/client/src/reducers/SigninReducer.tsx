import { AnyAction } from "redux";

import * as SigninDialog from "~components/Signin";
import { ActionType } from "~types/ActionTypes";

const initialState = {
  loading: false,
  errors: {},
  dialog: new SigninDialog.Closed(),
  email: undefined,
  password: undefined,
};

export default (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case ActionType.OPEN_LOGIN:
      return {
        loading: false,
        errors: {},
        dialog: new SigninDialog.LoginOpen(),
      };
    case ActionType.OPEN_SIGNUP:
      return {
        loading: false,
        errors: {},
        dialog: new SigninDialog.SignupOpen(),
      };
    case ActionType.OPEN_STUDENT_SIGNUP:
      return {
        loading: false,
        errors: {},
        dialog: new SigninDialog.StudentSignupOpen(),
      };
    case ActionType.OPEN_CONFIRM_SIGNUP:
      return {
        loading: false,
        errors: {},
        dialog: new SigninDialog.ConfirmSignupOpen(),
        credentials: action.payload,
      };
    case ActionType.OPEN_RESET_PASSWORD:
      return {
        loading: false,
        errors: {},
        dialog: new SigninDialog.ResetPasswordOpen(),
      };
    case ActionType.OPEN_CONFIRM_RESET_PASSWORD:
      return {
        loading: false,
        errors: {},
        dialog: new SigninDialog.ConfirmResetPasswordOpen(),
      };
    case ActionType.TRIGGER_SIGNIN_LOADING:
      return {
        ...state,
        loading: true,
      };
    case ActionType.CLOSE_SIGNIN:
      return {
        loading: false,
        errors: {},
        dialog: new SigninDialog.Closed(),
      };
    case ActionType.FAIL_LOGIN:
    case ActionType.FAIL_SIGNUP:
    case ActionType.FAIL_CONFIRM_SIGNUP:
    case ActionType.FAIL_STUDENT_SIGNUP:
      return {
        ...state,
        loading: false,
        errors: action.payload,
      };
    case ActionType.SUCCEED_LOGIN:
      return {
        loading: false,
        dialog: new SigninDialog.Closed(),
        errors: {},
      };
    case ActionType.SUCCEED_SIGNUP:
      return {
        ...state,
        loading: false,
        errors: {},
        dialog: new SigninDialog.LoginOpen(),
      };
    default:
      return state;
  }
};
