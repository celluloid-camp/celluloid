"use client";

import { createTheme } from "@mui/material/styles";

const container = () => document.getElementById("fullscreen");

const theme = createTheme({
  components: {
    MuiMenu: {
      defaultProps: {
        container,
      },
    },
    MuiTooltip: {
      defaultProps: {
        PopperProps: {
          container,
        },
      },
    },
  },
  palette: {
    primary: { main: "#ffffff" },
  },
});

export default theme;
