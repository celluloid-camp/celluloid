// import { MuiPickersUtilsProvider } from "@material-ui/pickers";
// import MomentUtils from "material-ui-pickers/utils/moment-utils";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import * as i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { ConfirmProvider } from "material-ui-confirm";
import React, { useState } from "react";
import { initReactI18next } from "react-i18next";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { SharedLayout } from "~components/SharedLayout";
import { trpc } from "~utils/trpc";

import ResetScroll from "./components/ResetScroll";
import UpdateIndicator from "./components/UpdateIndicator";
// import { ConnectedRouter } from "connected-react-router";
import en from "./locales/en/common.json";
import fr from "./locales/fr/common.json";
import { About } from "./pages/about";
import { CreateProjectPage } from "./pages/create";
import { HomePage } from "./pages/home";
import LegalNotice from "./pages/legal";
import UserProfile from "./pages/profile";
import { SharePage } from "./pages/share";
import { TermsAndConditions } from "./pages/terms";
import Project from "./scenes/Project";
import createAppStore from "./store";
import { createTheme } from "./theme";

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    resources: {
      en_US: {
        translations: en,
      },
      fr_FR: {
        translations: fr,
      },
    },
    ns: ["translations"],
    defaultNS: "translations",

    fallbackLng: "fr_FR",
    interpolation: {
      escapeValue: false,
    },
  } as i18next.InitOptions);

const store = createAppStore();

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/trpc",
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    })
  );

  return (
    <Provider store={store}>
      {/* <ConnectedRouter history={history}> */}
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <ConfirmProvider>
              {/* <MuiPickersUtilsProvider utils={MomentUtils}> */}
              <React.Fragment>
                <React.Fragment>
                  <UpdateIndicator />
                  <BrowserRouter>
                    <ResetScroll />
                    <Routes>
                      <Route path="/" element={<SharedLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="create" element={<CreateProjectPage />} />
                        <Route path="about" element={<About />} />
                        <Route path="profile" element={<UserProfile />} />
                        <Route path="legal-notice" element={<LegalNotice />} />
                        <Route
                          path="terms-and-conditions"
                          element={<TermsAndConditions />}
                        />
                        <Route
                          path="projects/:projectId"
                          element={<Project />}
                        />
                        <Route
                          path="shares/:projectId"
                          element={<SharePage />}
                        />
                        {/* <Route path="*" element={<NotFound />} /> */}
                      </Route>
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
          </QueryClientProvider>
        </trpc.Provider>
      </ThemeProvider>
      {/* </ConnectedRouter> */}
    </Provider>
  );
};

export default App;
