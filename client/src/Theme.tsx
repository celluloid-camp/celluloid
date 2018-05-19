import { createMuiTheme } from 'material-ui/styles';
import green from 'material-ui/colors/green';
import orange from 'material-ui/colors/orange';

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