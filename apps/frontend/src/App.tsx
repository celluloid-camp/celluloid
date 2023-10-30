import "dayjs/locale/fr"; // import locale

import { CssBaseline, Dialog, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink } from "@trpc/client";
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
  createBrowserRouter,
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

import { BootstrapDialog } from "~components/Dialog";
import { ConfirmDialog } from "~components/login/ConfirmDialog";
import { ForgotDialog } from "~components/login/ForgotDialog";
import { JoinDialog } from "~components/login/JoinDialog";
import { LoginDialog } from "~components/login/LoginDialog";
import { RecoverDialog } from "~components/login/RecoverDialog";
import { SignupDialog } from "~components/login/SignupDialog";
import { StudentSignupDialog } from "~components/login/StudentSignupDialog";
import { SharedLayout } from "~components/SharedLayout";
import { trpc } from "~utils/trpc";

import ResetScroll from "./components/ResetScroll";
import commonEN from "./locales/en/common.json";
import commonFR from "./locales/fr/common.json";
import { About } from "./pages/about";
import { CreateProjectPage } from "./pages/create";
import { HomePage } from "./pages/home";
import LegalNotice from "./pages/legal";
import UserProfile from "./pages/profile";
import ProjectPage from "./pages/project";
import { SharePage } from "./pages/share";
import { TermsAndConditions } from "./pages/terms";
import { createTheme } from "./theme";

const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "/trpc";

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
          <Route path="legal-notice" element={<LegalNotice />} />
          <Route path="terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="project/:projectId" element={<ProjectPage />} />
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
          url: API_URL,
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
