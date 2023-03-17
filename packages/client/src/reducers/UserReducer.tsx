import { AnyAction } from "redux";
import { ActionType } from "types/ActionTypes";

const initialState = null;

export default (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case ActionType.FAIL_GET_CURRENT_USER:
      return null;
    case ActionType.SUCCEED_GET_CURRENT_USER:
      return action.payload;
    case ActionType.FAIL_LOGOUT:
      return initialState;
    default:
      return state;
  }
};
