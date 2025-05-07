"use client";
import { TRPCProvider } from "@/lib/trpc/client";
import { theme } from "@/theme";
import { ThemeProvider } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { SnackbarProvider } from "notistack";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <TRPCProvider>
        <ConfirmProvider>
          <SnackbarProvider maxSnack={3} autoHideDuration={2000}>
            {children}
          </SnackbarProvider>
        </ConfirmProvider>
      </TRPCProvider>
    </ThemeProvider>
  );
};
