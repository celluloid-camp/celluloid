import { combineReducers } from 'redux';
import signin from './SigninReducer';
import user from './UserReducer';

const appReducer = combineReducers({ signin, user });

export default appReducer;