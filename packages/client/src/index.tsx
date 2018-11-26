import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';
import App from 'App';
import ResetScroll from 'components/ResetScroll';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import en from 'i18n/en';
import fr from 'i18n/fr';
import * as i18next from 'i18next';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { reactI18nextModule } from 'react-i18next';
import { Provider } from 'react-redux';
import registerServiceWorker from 'registerServiceWorker';
import { createAppStore } from 'store';
import { Bright } from 'utils/ThemeUtils';
import * as LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(reactI18nextModule)
  .use(LanguageDetector)
  .init({
    debug: true,
    resources: {
      en_US: {
        translation: en
      },
      fr_FR: {
        translation: fr
      }
    },
    fallbackLng: 'en_US',
    interpolation: {
      escapeValue: false
    }
  } as i18next.InitOptions);

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
registerServiceWorker(store);

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render(NextApp);
  });
}