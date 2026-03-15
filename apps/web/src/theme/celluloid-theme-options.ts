import type { ThemeOptions } from "@mui/material";

const neutral = {
  100: "#F3F4F6",
  200: "#E5E7EB",
  300: "#D1D5DB",
  400: "#9CA3AF",
  500: "#6B7280",
  600: "#4B5563",
  700: "#374151",
  800: "#1F2937",
  900: "#111827",
};

export const celluloidThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#557CFF",
      light: "#828DF8",
      dark: "#3832A0",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FF6B68",
      light: "#3FC79A",
      dark: "#0B815A",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#2196F3",
      light: "#64B6F7",
      dark: "#0B79D0",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#14B8A6",
      light: "#43C6B7",
      dark: "#0E8074",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#FFB020",
      light: "#FFBF4C",
      dark: "#B27B16",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#D14343",
      light: "#DA6868",
      dark: "#922E2E",
      contrastText: "#FFFFFF",
    },
    text: {
      primary: "#121828",
      secondary: "#65748B",
      disabled: "rgba(55, 65, 81, 0.48)",
    },
    background: {
      default: "#F9FAFC",
      paper: "#FFFFFF",
      dark: "#292929",
    },
    divider: "#E6E8F0",
    neutral,
    brand: {
      green: "#C2CCAB",
      orange: "#FFE7DB",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#EFEFEF",
          minHeight: 52,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 34,
          height: 34,
          fontSize: 12,
          backgroundColor: neutral[500],
          color: "#FFFFFF",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "52px !important",
          paddingLeft: 12,
          paddingRight: 12,
        },
        dense: {
          minHeight: "44px !important",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
};
