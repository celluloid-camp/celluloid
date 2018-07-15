import { Action } from 'types/Action';
import ActionType from 'types/ActionType';

export function closeSignin():
Action<null> {
  return {
    type: ActionType.CLOSE_SIGNIN,
  };
}

export function triggerSigninLoading():
Action<null> {
  return {
    type: ActionType.TRIGGER_SIGNIN_LOADING
  };
}

export * from './LoginActions';
export * from './SignupActions';
export * from './UserActions';