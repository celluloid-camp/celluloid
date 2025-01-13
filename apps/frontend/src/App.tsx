import "dayjs/locale/fr"; // import locale
import "dayjs/locale/es"; // import locale
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import * as dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isLeapYear from "dayjs/plugin/isLeapYear"; // import plugin
import relativeTime from "dayjs/plugin/relativeTime";
import * as i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { ConfirmProvider } from "material-ui-confirm";
import { SnackbarProvider } from "notistack";
import React, { Suspense, useCallback, useState } from "react";
import { initReactI18next } from "react-i18next";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useRoutes,
} from "react-router-dom";
import { RecoilRoot } from "recoil";
import { setLocale } from "yup";
import { fr } from "yup-locales";

import { ConfirmDialog } from "~components/auth/ConfirmDialog";
import { ForgotDialog } from "~components/auth/ForgotDialog";
import { JoinDialog } from "~components/auth/JoinDialog";
import { LoginDialog } from "~components/auth/LoginDialog";
import { RecoverDialog } from "~components/auth/RecoverDialog";
import { SignupDialog } from "~components/auth/SignupDialog";
import { StudentSignupDialog } from "~components/auth/StudentSignupDialog";
import { BootstrapDialog } from "~components/Dialog";
import { SharedLayout } from "~components/SharedLayout";
import { trpc } from "~utils/trpc";

import ResetScroll from "./components/ResetScroll";
import commonEN from "./locales/en/common.json";
import commonES from "./locales/es/common.json";
import commonFR from "./locales/fr/common.json";
import { About } from "./pages/about";
import { CreateProjectPage } from "./pages/create";
import { HomePage } from "./pages/home";
import LegalNotice from "./pages/legal";
import UserProfile from "./pages/profile";
import ProjectPage from "./pages/project";
import SettingsPage from "./pages/settings";
import { SharePage } from "./pages/share";
import { TermsAndConditions } from "./pages/terms";
import { createTheme } from "./theme";
import ProjectStatsPage from "./pages/project-stats";

const API_URL = "/api/trpc";

dayjs.extend(relativeTime);
dayjs.extend(isLeapYear); // use plugin
dayjs.extend(duration);
dayjs.locale("fr-fr"); // use locale

setLocale(fr);

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    resources: {
      en_US: {
        translations: commonEN,
      },
      fr_FR: {
        translations: commonFR,
      },
      es_ES: {
        translations: commonES,
      },
    },
    ns: ["translations"],
    defaultNS: "translations",
    fallbackLng: "fr_FR",
    interpolation: {
      escapeValue: false,
    },
  } as i18next.InitOptions);

const AppRouters = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { backgroundPath?: string };

  const background = state?.backgroundPath ?? "/";

  const dismissHandler = useCallback(
    () => navigate(background),
    [navigate, background]
  );

  const modalElement = useRoutes([
    {
      path: "/login",
      element: <LoginDialog />,
    },
    {
      path: "/signup",
      element: <SignupDialog />,
    },
    {
      path: "/recover",
      element: <RecoverDialog />,
    },
    {
      path: "/confirm",
      element: <ConfirmDialog />,
    },
    {
      path: "/forgot",
      element: <ForgotDialog />,
    },
    {
      path: "/signup-student",
      element: <StudentSignupDialog />,
    },
    {
      path: "/join",
      element: <JoinDialog />,
    },
  ]);

  return (
    <div>
      <Routes location={modalElement !== null ? background : undefined}>
        <Route path="/" element={<SharedLayout />}>
          <Route index element={<HomePage />} />
          <Route path="create" element={<CreateProjectPage />} />
          <Route path="about" element={<About />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="legal-notice" element={<LegalNotice />} />
          <Route path="terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="project/:projectId" element={<ProjectPage />} />
          <Route
            path="project/:projectId/stats"
            element={<ProjectStatsPage />}
          />
          <Route path="shares/:projectId" element={<SharePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Route>
        <Route path="/shares/:projectId" element={<SharePage />} />
      </Routes>
      <BootstrapDialog
        open={modalElement !== null}
        scroll="body"
        maxWidth="xs"
        fullWidth={true}
        onClose={dismissHandler}
      >
        {modalElement}
      </BootstrapDialog>
    </div>
  );
};
const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
        // splitLink({
        //   condition(op) {
        //     // check for operation type
        //     return op.type === "subscription";
        //   },
        //   // when condition is true, use normal request
        //   true: wsLink({
        //     client: createWSClient({
        //       url: WS_URL,
        //     }),
        //   }),
        //   // when condition is false, use batching
        //   false: httpBatchLink({
        //     url: API_URL,
        //     fetch(url, options) {
        //       return fetch(url, {
        //         ...options,
        //         credentials: "include",
        //       });
        //     },
        //   }),
        // }),
      ],
    })
  );

  return (
    <Suspense fallback="loading">
      <RecoilRoot>
        <ThemeProvider theme={createTheme()}>
          <CssBaseline />
          <SnackbarProvider maxSnack={3}>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
              <QueryClientProvider client={queryClient}>
                <ConfirmProvider>
                  <BrowserRouter>
                    <ResetScroll />
                    <AppRouters />
                  </BrowserRouter>
                </ConfirmProvider>
                <ReactQueryDevtools initialIsOpen={false} />
              </QueryClientProvider>
            </trpc.Provider>
          </SnackbarProvider>
        </ThemeProvider>
      </RecoilRoot>
    </Suspense>
  );
};

export default App;
