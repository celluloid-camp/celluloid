import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import Theme from './Theme';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';

import { MuiThemeProvider } from '@material-ui/core/styles';
ReactDOM.render(
  <Router>
    <MuiThemeProvider theme={Theme}>
      <App />
    </MuiThemeProvider>
  </Router>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
