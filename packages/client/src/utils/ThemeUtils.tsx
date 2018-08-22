import { createMuiTheme } from '@material-ui/core/styles';
import { deepOrange, green } from '@material-ui/core/colors';

const themeConfig = {
  palette: {
    primary: { main: green['600'] },
    secondary: deepOrange
  },
};

const Bright = createMuiTheme(themeConfig);

const Dark = createMuiTheme({
  ...themeConfig,
  palette: {
    ...themeConfig.palette,
    type: 'dark'
  }
});

export { Bright, Dark };