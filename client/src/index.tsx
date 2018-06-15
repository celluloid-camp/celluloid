import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import Theme from './Theme';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';

import { MuiThemeProvider } from '@material-ui/core/styles';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import CssBaseline from '@material-ui/core/CssBaseline';

ReactDOM.render(
  <Router>
    <MuiThemeProvider theme={Theme}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <React.Fragment>
          <CssBaseline />
          <App />
        </React.Fragment>
      </MuiPickersUtilsProvider>
    </MuiThemeProvider>
  </Router>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
