import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory, History } from 'history';
import { applyMiddleware, compose, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import createRootReducer from '../reducers'



export const history = createBrowserHistory()

export default function createAppStore(preloadedState?: any) {
  const composeEnhancer =
  (process.env.NODE_ENV === 'development' &&
    (window as any)?.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;
  const store = createStore(
    createRootReducer(history),
    preloadedState,
    composeEnhancer(
      applyMiddleware(
        routerMiddleware(history),
      ),
    ),
  )

  // Hot reloading
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      store.replaceReducer(createRootReducer(history));
    });
  }

  return store
}
