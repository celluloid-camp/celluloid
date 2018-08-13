import { Action, ActionType } from 'types/ActionTypes';

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
export * from './ResetPasswordActions';
export * from './StudentSignupActions';