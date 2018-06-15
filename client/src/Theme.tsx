import { createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

const Theme = createMuiTheme({
  typography: {
    fontFamily: 'Asap',
  },
  palette: {
    primary: { main: green['600'] },
    secondary: { main: red['500'] }
  },
});

export default Theme;