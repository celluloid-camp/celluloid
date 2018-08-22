import appReducer from 'reducers/AppReducer';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { History } from 'history';

export const createAppStore = (history: History) => createStore(
  connectRouter(history)(appReducer),
  composeWithDevTools(
    applyMiddleware(
      thunkMiddleware,
      routerMiddleware(history)
    ),
  )
);