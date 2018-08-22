import { connectRouter, routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import appReducer from 'reducers/AppReducer';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';

export const createAppStore = (history: History) => {
  const store = createStore(
    connectRouter(history)(appReducer),
    composeWithDevTools(
      applyMiddleware(thunkMiddleware, routerMiddleware(history))
    )
  );

  if (process.env.NODE_ENV !== 'production') {
    if (module.hot) {
      module.hot.accept('../reducers/AppReducer', () => {
        store.replaceReducer(appReducer);
      });
    }
  }
  return store;
};