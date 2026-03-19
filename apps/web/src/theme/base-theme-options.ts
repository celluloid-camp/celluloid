import type { ThemeOptions } from "@mui/material";

export const baseThemeOptions: ThemeOptions = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 1000,
      lg: 1200,
      xl: 1920,
    },
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    button: {
      fontWeight: 600,
      fontSize: "0.8125rem",
      textTransform: "none",
    },
    fontFamily:
      '"lexendregular", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    body1: {
      fontSize: "0.9rem",
      fontWeight: 400,
      lineHeight: 1.4,
    },
    body2: {
      fontSize: "0.78rem",
      fontWeight: 400,
      lineHeight: 1.4,
    },
    h1: {
      fontWeight: 700,
      fontSize: "2.75rem",
      lineHeight: 1.3,
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.2rem",
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      fontSize: "1.7rem",
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 700,
      fontSize: "1.5rem",
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.2rem",
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      fontSize: "0.95rem",
      lineHeight: 1.3,
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiLink: {
      defaultProps: {
        underline: "hover",
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        title: {
          fontSize: "0.9rem",
          fontWeight: 600,
          lineHeight: 1.3,
        },
        subheader: {
          fontSize: "0.78rem",
          lineHeight: 1.4,
          color: "var(--color-text-secondary)",
        },
      },
    },
  },
  zIndex: {
    appBar: 1200,
    drawer: 1100,
  },
};
