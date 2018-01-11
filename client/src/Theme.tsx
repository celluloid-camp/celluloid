import { createMuiTheme } from 'material-ui/styles';
import green from 'material-ui/colors/green';

const Theme = createMuiTheme({
  typography: {
    fontFamily: 'Asap',
    button: {
      textTransform: 'none'
    }
  },
  palette: {
    primary: { ...green }
  },
});

export default Theme;