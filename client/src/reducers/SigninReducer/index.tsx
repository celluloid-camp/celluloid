import { combineReducers } from 'redux';
import dialog from './DialogReducer';
import login from './LoginReducer';
import signup from './SignupReducer';

export default combineReducers({
  dialog,
  login,
  signup
});