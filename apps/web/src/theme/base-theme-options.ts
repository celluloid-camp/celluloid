import { ThemeOptions } from "@mui/material";

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
  components: {
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 34,
          height: 34,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          minHeight: 52,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
        },
        sizeSmall: {
          padding: "5px 12px",
        },
        sizeMedium: {
          padding: "6px 16px",
        },
        sizeLarge: {
          padding: "8px 20px",
        },
        textSizeSmall: {
          padding: "5px 8px",
        },
        textSizeMedium: {
          padding: "6px 12px",
        },
        textSizeLarge: {
          padding: "8px 12px",
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: "12px 16px",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "20px 16px",
          "&:last-child": {
            paddingBottom: "20px",
          },
        },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: {
          variant: "h6",
        },
        subheaderTypographyProps: {
          variant: "body2",
        },
      },
      styleOverrides: {
        root: {
          padding: "20px 16px",
        },
      },
    },
    MuiCheckbox: {
      defaultProps: {
        color: "primary",
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        '*': {
          boxSizing: 'border-box'
        }
        @font-face {
          font-family: 'abril_fatfaceregular';
          src: url('/fonts/abrilfatface-regular-webfont.woff') format('woff'),
            url(/fonts/abrilfatface-regular-webfont.woff2) format('woff2');
          font-weight: normal;
          font-style: normal;
        }
        @font-face {
          font-family: 'lexendregular';
          src: url('/fonts/lexend-variablefont_wght-webfont.woff2') format('woff2'),
              url('/fonts/lexend-variablefont_wght-webfont.woff') format('woff');
          font-weight: normal;
          font-style: normal;
        }

        html: {
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%'
        },
        body: {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%'
        },
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          transition: background-color 600000s 0s, color 600000s 0s;
        }
        `,
    },
    MuiDrawer: {},
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: 6,
        },
        sizeSmall: {
          padding: 3,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          overflow: "hidden",
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: "hover",
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          marginRight: "12px",
          "&.MuiListItemIcon-root": {
            minWidth: "unset",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          fontWeight: 500,
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
    MuiPopover: {
      defaultProps: {
        elevation: 16,
      },
    },
    MuiRadio: {
      defaultProps: {
        color: "primary",
      },
    },
    MuiSwitch: {
      defaultProps: {
        color: "primary",
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1.5,
          minWidth: "auto",
          paddingLeft: 0,
          paddingRight: 0,
          textTransform: "none",
          "& + &": {
            marginLeft: 16,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "10px 12px",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          borderBottom: "none",
          "& .MuiTableCell-root": {
            borderBottom: "none",
            fontSize: "12px",
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          },
          "& .MuiTableCell-paddingCheckbox": {
            paddingTop: 4,
            paddingBottom: 4,
          },
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
        gutters: {
          paddingLeft: 12,
          paddingRight: 12,
        },
        regular: {
          minHeight: "52px !important",
        },
        dense: {
          minHeight: "44px !important",
        },
      },
    },
  },
  direction: "ltr",
  shape: {
    borderRadius: 6,
  },
  typography: {
    button: {
      fontWeight: 600,
      fontSize: "0.8125rem",
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
    subtitle1: {
      fontSize: "0.9rem",
      fontWeight: 500,
      lineHeight: 1.45,
    },
    subtitle2: {
      fontSize: "0.78rem",
      fontWeight: 500,
      lineHeight: 1.4,
    },
    overline: {
      fontSize: "0.68rem",
      fontWeight: 600,
      letterSpacing: "0.5px",
      lineHeight: 2.1,
      textTransform: "uppercase",
    },
    caption: {
      fontSize: "0.66rem",
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
  zIndex: {
    appBar: 1200,
    drawer: 1100,
  },
};
