// import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
// import MomentUtils from "material-ui-pickers/utils/moment-utils";
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
import ShareGuide from "./scenes/ShareGuide";
import createAppStore from "./store";

const queryClient = new QueryClient();

import { ThemeProvider } from "@mui/material";

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
        <QueryClientProvider client={queryClient}>
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
                  <Route path="/projects/:projectId" element={<Project />} />
                  <Route path="/shares/:projectId" element={<ShareGuide />} />
                </Routes>
              </BrowserRouter>
            </React.Fragment>
          </React.Fragment>
          {/* </MuiPickersUtilsProvider> */}
        </QueryClientProvider>
      </ThemeProvider>
      {/* </ConnectedRouter> */}
    </Provider>
  );
};

export default Content;
