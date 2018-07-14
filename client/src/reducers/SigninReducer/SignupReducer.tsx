import ActionType from 'types/ActionType';
import { AnyAction } from 'redux';

const initialState = {};

export default (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case ActionType.FAIL_SIGNUP:
      return action.payload;
    case ActionType.SUCCEED_SIGNUP:
      return {};
    default:
      return state;
  }
};