import * as SigninDialog from 'components/Signin';
import ActionType from 'types/ActionType';
import { AnyAction } from 'redux';

const initialState = {
  loading: false,
  errors: {},
  dialog: new SigninDialog.Closed(),
  email: undefined
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
    case ActionType.OPEN_CONFIRM_SIGNUP:
      return {
        loading: false,
        errors: {},
        dialog: new SigninDialog.ConfirmSignupOpen(),
        email: action.payload
      };
    case ActionType.TRIGGER_SIGNIN_LOADING:
      return {
        ...state,
        loading: true
      };
    case ActionType.CLOSE_SIGNIN:
      return {
        loading: false,
        errors: {},
        dialog: new SigninDialog.Closed()
      };
    case ActionType.FAIL_LOGIN:
    case ActionType.FAIL_SIGNUP:
    case ActionType.FAIL_CONFIRM_SIGNUP:
      return {
        ...state,
        loading: false,
        errors: action.payload,
      };
    case ActionType.SUCCEED_LOGIN:
    case ActionType.SUCCEED_SIGNUP:
      return {
        ...state,
        loading: false,
        errors: {},
      };
    default:
      return state;
  }
};