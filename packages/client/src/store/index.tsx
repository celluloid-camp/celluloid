import appReducer from 'reducers/AppReducer';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';

const store = createStore(
    appReducer,
    composeWithDevTools(applyMiddleware(thunkMiddleware))
);

export default store;