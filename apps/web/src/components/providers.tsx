"use client";
import { ThemeProvider } from "@mui/material/styles";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfirmProvider } from "material-ui-confirm";
import { SnackbarProvider } from "notistack";
import { TRPCProvider } from "@/lib/trpc/client";
import { theme } from "@/theme";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <TRPCProvider>
        <ConfirmProvider>
          <SnackbarProvider maxSnack={3} autoHideDuration={2000}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </SnackbarProvider>
        </ConfirmProvider>
      </TRPCProvider>
    </ThemeProvider>
  );
};
