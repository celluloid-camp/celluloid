import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from 'App';
import registerServiceWorker from 'registerServiceWorker';
import Theme from 'utils/ThemeUtils';
import { BrowserRouter as Router } from 'react-router-dom';
import ResetScroll from 'components/ResetScroll';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Provider } from 'react-redux';
import store from 'store';

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <ResetScroll>
        <MuiThemeProvider theme={Theme}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <React.Fragment>
              <CssBaseline />
              <App />
            </React.Fragment>
          </MuiPickersUtilsProvider>
        </MuiThemeProvider>
      </ResetScroll>
    </Router>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
