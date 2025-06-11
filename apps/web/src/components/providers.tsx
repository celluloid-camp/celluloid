"use client";
import { TRPCProvider } from "@/lib/trpc/client";
import { theme } from "@/theme";
import { ThemeProvider } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { SnackbarProvider } from "notistack";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
