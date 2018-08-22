import { Bright } from '@celluloid/client/src/utils/ThemeUtils';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';
import App from 'App';
import ResetScroll from 'components/ResetScroll';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import registerServiceWorker from 'registerServiceWorker';
import { createAppStore } from 'store';

const history = createBrowserHistory();
const store = createAppStore(history);
const render = (Component: React.ComponentType) => {
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <ResetScroll>
          <MuiThemeProvider theme={Bright}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <React.Fragment>
                <CssBaseline />
                <Component />
              </React.Fragment>
            </MuiPickersUtilsProvider>
          </MuiThemeProvider>
        </ResetScroll>
      </ConnectedRouter>
    </Provider>,
    document.getElementById('root') as HTMLElement
  );
};
render(App);
registerServiceWorker();
store.dispatch({type: 'APPLICATION_UPDATED'});

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render(NextApp);
  });
}