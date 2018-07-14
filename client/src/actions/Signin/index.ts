import { Action } from 'types/Action';
import ActionType from 'types/ActionType';

export function closeSignin():
Action<null> {
  return {
    type: ActionType.CLOSE_SIGNIN,
  };
}

export * from './Login';
export * from './Signup';
export * from './User';