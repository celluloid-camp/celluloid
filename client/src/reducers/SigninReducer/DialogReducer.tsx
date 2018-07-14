import * as SigninDialog from 'components/Signin';
import ActionType from 'types/ActionType';
import { AnyAction } from 'redux';

const initialState = new SigninDialog.Closed();

export default (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case ActionType.OPEN_LOGIN:
      return new SigninDialog.LoginOpen();
    case ActionType.OPEN_SIGNUP:
      return new SigninDialog.SignupOpen();
    case ActionType.CLOSE_SIGNIN:
      return new SigninDialog.Closed();
    default:
      return state;
  }
};