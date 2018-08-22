import { combineReducers } from 'redux';

import details from './ProjectReducer';
import sharing from './SharingReducer';
import signin from './SigninReducer';
import user from './UserReducer';
import video from './VideoReducer';

const appReducer = combineReducers({
  signin,
  user,
  sharing,
  projectPage : combineReducers({
    video,
    details
  })
});

export default appReducer;