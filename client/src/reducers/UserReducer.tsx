import ActionType from 'types/ActionType';
import { AnyAction } from 'redux';

const initialState = null;

export default (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case ActionType.FAIL_CURRENT_USER:
      return null;
    case ActionType.SUCCEED_CURRENT_USER:
      return action.payload;
    case ActionType.FAIL_LOGOUT:
      return initialState;
    default:
      return state;
  }
};