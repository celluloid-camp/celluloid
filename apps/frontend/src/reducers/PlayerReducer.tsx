import { AnyAction } from "redux";

import { ActionType } from "~types/ActionTypes";
import { PlayerState } from "~types/StateTypes";

const initialState = {
  seeking: false,
} as PlayerState;

export default (
  state = initialState,
  { type, payload }: AnyAction
): PlayerState => {
  switch (type) {
    case ActionType.PLAYER_NOTIFY_SEEK:
      return {
        ...state,
        seeking: false,
      };
    case ActionType.PLAYER_REQUEST_SEEK:
      return {
        seeking: true,
        seekTarget: payload,
      };
    default:
      return state;
  }
};
