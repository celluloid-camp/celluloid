"use client";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/theme";
import { SnackbarProvider } from "notistack";
import { ConfirmProvider } from "material-ui-confirm";
import { TRPCProvider } from "@/lib/trpc/client";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <TRPCProvider>
        <ConfirmProvider>
          <SnackbarProvider maxSnack={3} autoHideDuration={2000}>{children}</SnackbarProvider>
        </ConfirmProvider>
      </TRPCProvider>
    </ThemeProvider>
  );
};
