"use client";

import type { Theme } from "@mui/material";
import {
  createTheme as createMuiTheme,
  responsiveFontSizes,
} from "@mui/material/styles";

import { baseThemeOptions } from "./base-theme-options";
import { celluloidThemeOptions } from "./celluloid-theme-options";
// import { reactRouterThemeOptions } from "./react-router-link";

interface Neutral {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

declare module "@mui/material/styles" {
  interface Palette {
    neutral?: Neutral;
    brand: { green: string, orange: string };
  }

  interface PaletteOptions {
    neutral?: Neutral;
    brand: { green: string, orange: string };
  }
}


export const createTheme = (): Theme => {
  let theme = createMuiTheme(baseThemeOptions, celluloidThemeOptions, /*reactRouterThemeOptions*/);

  theme = responsiveFontSizes(theme);

  return theme;
};


export const theme = createTheme();
