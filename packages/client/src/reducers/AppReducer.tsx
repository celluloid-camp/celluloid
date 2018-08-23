import { AnyAction, combineReducers } from 'redux';
import { ActionType } from 'types/ActionTypes';

import home from './HomeReducer';
import details from './ProjectReducer';
import sharing from './SharingReducer';
import signin from './SigninReducer';
import user from './UserReducer';
import video from './VideoReducer';

const updatedReducer = (state = false, action: AnyAction): boolean => {
  switch (action.type) {
    case ActionType.APPLICATION_UPDATED:
      return true;
    default:
      return state;
  }
};

const appReducer = combineReducers({
  signin,
  user,
  sharing,
  project : combineReducers({
    video,
    details
  }),
  home,
  updated : updatedReducer
});

export default appReducer;