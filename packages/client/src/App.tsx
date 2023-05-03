// import { MuiPickersUtilsProvider } from "@material-ui/pickers";
// import MomentUtils from "material-ui-pickers/utils/moment-utils";
import ClickAwayListener from "@mui/base/ClickAwayListener";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { ConfirmProvider } from "material-ui-confirm";
import React from "react";
import { initReactI18next } from "react-i18next";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { About } from "./components/About";
import LegalNotice from "./components/LegalNotice";
import NotFound from "./components/NotFound";
import ResetScroll from "./components/ResetScroll";
import TermsAndConditions from "./components/TermsAndConditions";
import UpdateIndicator from "./components/UpdateIndicator";
// import { ConnectedRouter } from "connected-react-router";
import en from "./locales/en/common.json";
import fr from "./locales/fr/common.json";
import Home from "./scenes/Home";
import Project from "./scenes/Project";
import createAppStore from "./store";

const queryClient = new QueryClient();

import { CssBaseline, ThemeProvider } from "@mui/material";

import { SharePage } from "./pages/share";
import { createTheme } from "./theme";

i18next
  .use(initReactI18next)
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

const Content = () => {
  return (
    <Provider store={store}>
      {/* <ConnectedRouter history={history}> */}
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <ClickAwayListener>
            <ConfirmProvider>
              {/* <MuiPickersUtilsProvider utils={MomentUtils}> */}
              <React.Fragment>
                <React.Fragment>
                  <UpdateIndicator />
                  <BrowserRouter>
                    <ResetScroll />
                    <Routes>
                      <Route
                        path="/"
                        element={<Home />}
                        errorElement={<NotFound />}
                      />
                      <Route path="/about" element={<About />} />
                      <Route path="/legal-notice" element={<LegalNotice />} />
                      <Route
                        path="/terms-and-conditions"
                        element={<TermsAndConditions />}
                      />
                      <Route
                        path="/projects/:projectId"
                        element={<Project />}
                      />
                      <Route
                        path="/shares/:projectId"
                        element={<SharePage />}
                      />
                    </Routes>
                  </BrowserRouter>
                </React.Fragment>
              </React.Fragment>
              {/* </MuiPickersUtilsProvider> */}
            </ConfirmProvider>
          </ClickAwayListener>
        </QueryClientProvider>
      </ThemeProvider>
      {/* </ConnectedRouter> */}
    </Provider>
  );
};

export default Content;
