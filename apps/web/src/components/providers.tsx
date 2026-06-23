"use client";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { ThemeProvider } from "@mui/material/styles";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Agentation } from "agentation";
import { ConfirmProvider } from "material-ui-confirm";
import { SnackbarProvider } from "notistack";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCProvider } from "@/lib/trpc/provider";
import { theme } from "@/theme";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <TRPCProvider>
        <NuqsAdapter>
          <AuthQueryProvider>
            <ConfirmProvider>
              <SnackbarProvider maxSnack={3} autoHideDuration={2000}>
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
              </SnackbarProvider>
            </ConfirmProvider>
          </AuthQueryProvider>
        </NuqsAdapter>
      </TRPCProvider>
      {process.env.NODE_ENV === "development" && <Agentation />}
    </ThemeProvider>
  );
};
