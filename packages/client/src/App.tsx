import { createStyles, withStyles } from "@material-ui/core";
import About from "components/About";
import LegalNotice from "components/LegalNotice";
import NotFound from "components/NotFound";
import TermsAndConditions from "components/TermsAndConditions";
import UpdateIndicator from "components/UpdateIndicator";
import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "scenes/Home";
import { withMenu } from "scenes/Menu";
import Project from "scenes/Project";
import ShareGuide from "scenes/ShareGuide";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider } from "@material-ui/core/styles";
import ResetScroll from "components/ResetScroll";
import { ConnectedRouter } from "connected-react-router";
import en from "i18n/en";
import fr from "i18n/fr";
import * as i18next from "i18next";
// import MomentUtils from 'material-ui-pickers/utils/moment-utils';
// import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';

import { reactI18nextModule } from "react-i18next";
import { Provider } from "react-redux";
import createAppStore, { history } from "store";
import { Bright } from "utils/ThemeUtils";
import * as LanguageDetector from "i18next-browser-languagedetector";

i18next
  .use(reactI18nextModule)
  .use(LanguageDetector)
  .init({
    debug: false,
    resources: {
      en_US: {
        translation: en,
      },
      fr_FR: {
        translation: fr,
      },
    },
    fallbackLng: "en_US",
    interpolation: {
      escapeValue: false,
    },
  } as i18next.InitOptions);

const store = createAppStore();

const styles = createStyles({
  "@global": {
    a: {
      color: "#42a6f5",
    },
  },
});

const Content = () => {
  return (
    <Provider store={store}>
      {/* @ts-ignore */}
      <ConnectedRouter history={history}>
        <ResetScroll>
          <MuiThemeProvider theme={Bright}>
            {/* <MuiPickersUtilsProvider utils={MomentUtils}> */}
            <React.Fragment>
              <CssBaseline />
              <React.Fragment>
                <UpdateIndicator />
                <Switch>
                  <Route exact={true} path="/" component={withMenu(Home)} />
                  <Route
                    exact={true}
                    path="/about"
                    component={withMenu(About)}
                  />
                  <Route
                    exact={true}
                    path="/legal-notice"
                    component={withMenu(LegalNotice)}
                  />
                  <Route
                    exact={true}
                    path="/terms-and-conditions"
                    component={withMenu(TermsAndConditions)}
                  />
                  <Route
                    path="/projects/:projectId"
                    component={withMenu(Project)}
                  />
                  <Route path="/shares/:projectId" component={ShareGuide} />
                  <Route component={withMenu(NotFound)} />
                </Switch>
              </React.Fragment>
            </React.Fragment>
            {/* </MuiPickersUtilsProvider> */}
          </MuiThemeProvider>
        </ResetScroll>
      </ConnectedRouter>
    </Provider>
  );
};

export default withStyles(styles)(Content);
