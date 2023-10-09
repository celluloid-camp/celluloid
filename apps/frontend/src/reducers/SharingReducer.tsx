import { AnyAction } from "redux";

import { ActionType } from "~types/ActionTypes";
import { SharingState, SharingStatus } from "~types/StateTypes";

const initialState = {
  error: undefined,
  status: SharingStatus.CLOSED,
} as SharingState;

export default (state = initialState, action: AnyAction): SharingState => {
  switch (action.type) {
    case ActionType.TRIGGER_SHARE_PROJECT_LOADING:
      return {
        status: SharingStatus.LOADING,
        error: undefined,
      };
    case ActionType.SUCCEED_SHARE_PROJECT:
      return {
        status: SharingStatus.CLOSED,
        error: undefined,
      };
    case ActionType.FAIL_SHARE_PROJECT:
      return {
        status: SharingStatus.ERROR,
        error: action.payload,
      };
    case ActionType.OPEN_SHARE_PROJECT:
      return {
        status: SharingStatus.OPEN,
        error: undefined,
      };
    case ActionType.CANCEL_SHARE_PROJECT:
      return {
        status: SharingStatus.CLOSED,
        error: undefined,
      };
    default:
      return state;
  }
};
