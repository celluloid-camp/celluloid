import { connectRouter } from "connected-react-router";
import { History } from "history";
import { AnyAction, combineReducers } from "redux";

import { ActionType } from "~types/ActionTypes";

import sharing from "./SharingReducer";
import signin from "./SigninReducer";
import user from "./UserReducer";

const updatedReducer = (state = false, action: AnyAction): boolean => {
  switch (action.type) {
    case ActionType.APPLICATION_UPDATED:
      return true;
    default:
      return state;
  }
};

const rootReducer = (history: History) =>
  combineReducers({
    signin,
    user,
    sharing,
    updated: updatedReducer,
    router: connectRouter(history),
  });

export default rootReducer;
