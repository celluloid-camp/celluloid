"use client";
import { createTheme } from "@mui/material/styles";

// NOTE: This ensures that things like <Menu> and <Tooltip> components show up while in fullscreen.
// For more, see: https://github.com/mui/material-ui/issues/15618#issuecomment-1062138287
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
    brand: {
      green: "#00FF00",
      orange: "#FFA500",
    },
  },
});

export default theme;
