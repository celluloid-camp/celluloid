import { connectRouter } from "connected-react-router";
import { History } from "history";
import { AnyAction, combineReducers } from "redux";

import { ActionType } from "~types/ActionTypes";

import home from "./HomeReducer";
import player from "./PlayerReducer";
import details from "./ProjectReducer";
import sharing from "./SharingReducer";
import signin from "./SigninReducer";
import tags from "./TagsReducer";
import user from "./UserReducer";
import video from "./VideoReducer";

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
    project: combineReducers({
      video,
      details,
      player,
    }),
    home,
    updated: updatedReducer,
    tags,
    router: connectRouter(history),
  });

export default rootReducer;
