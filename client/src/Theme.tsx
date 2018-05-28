import { createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import orange from '@material-ui/core/colors/orange';

const Theme = createMuiTheme({
  typography: {
    fontFamily: 'Asap',
    button: {
      textTransform: 'none'
    }
  },
  palette: {
    primary: { ...green },
    secondary: { ...orange }
  },
});

export default Theme;