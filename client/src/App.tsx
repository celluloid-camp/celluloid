import * as React from 'react';
import { Route, Switch, NavLink, RouteComponentProps, withRouter } from 'react-router-dom';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import { WithStyles } from 'material-ui/styles/withStyles';
import Home from './Home';
import Project from './Project';
import Video from './Video';
import IconButton from 'material-ui/IconButton';
import 'flag-icon-css/css/flag-icon.css';
import TeacherSignup, { TeacherSignupPayload, TeacherSignupAction } from './TeacherSignup';
import TeacherLogin, { TeacherLoginAction } from './TeacherLogin';
import { TeacherCredentials } from './types/Teacher';

const decorate = withStyles(({ palette, spacing }) => ({
  grow: {
    flex: 1
  },
  largeBar: {
    height: '80px'
  },
}));

interface Props extends RouteComponentProps<{}> {

}

const Menu = withRouter(decorate<Props>(
  class extends React.Component<
    Props
    & WithStyles<'grow' | 'largeBar'>
    > {

    state = {
      signupOpen: false,
      loginOpen: false
    };

    render() {
      const showLogin = () => {
        this.setState({ loginOpen: true });
      };

      const showSignup = () => {
        this.setState({ signupOpen: true });
      };

      const closeLogin = (action: TeacherLoginAction, value: TeacherCredentials) => {
        this.setState({ loginOpen: false });
        switch (action) {
          case TeacherLoginAction.Login:
            break;
          case TeacherLoginAction.ForgotPassword:
            break;
          case TeacherLoginAction.Signup:
            this.setState({ signupOpen: true });
            break;
          case TeacherLoginAction.None:
            break;
          default:
            break;
        }
        return Promise.resolve({});
      };

      const closeSignup = (action: TeacherSignupAction, value: TeacherSignupPayload) => {
        this.setState({ signupOpen: false });
        this.setState({ loginOpen: false });
        switch (action) {
          case TeacherSignupAction.Login:
            this.setState({ loginOpen: true });
            break;
          case TeacherSignupAction.Signup:
            break;
          case TeacherSignupAction.None:
            break;
          default:
            break;
        }
        return Promise.resolve({});
      };

      const classes = this.props.classes;
      return (
        <div>
          <AppBar color="default" className={classes.largeBar}>
            <Toolbar>
              <div className={classes.grow}>
                <NavLink to="/" style={{ textDecoration: 'none' }}>
                  <Typography type="display1">
                    <b>{`Celluloid`}</b>
                  </Typography>
                </NavLink>
              </div>
              <IconButton>
                <span
                  style={{ height: 18, width: 24, margin: 0, border: '1px solid #141414' }}
                  className="flag-icon flag-icon-fr"
                />
              </IconButton>
              <Button>{`À propos`}</Button>
              <Button
                onClick={showSignup}
              >
                {`Inscription`}
              </Button>
              <Button
                onClick={showLogin}
                color="primary"
              >
                {`Connexion`}
              </Button>
            </Toolbar>
          </AppBar >
          <TeacherSignup
            onClose={closeSignup}
            isOpen={this.state.signupOpen}
          />
          <TeacherLogin
            onClose={closeLogin}
            isOpen={this.state.loginOpen}
          />
          <div style={{ paddingTop: 100 }}>
            {this.props.children}
          </div>
        </div>
      );
    }
  }
));

const menuified = (component: JSX.Element) => () => {
  return (<Menu>{component}</Menu>);
};

class App extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact={true} path="/" render={menuified(<Home />)} />
        <Route path="/projects/:projectId/video" component={Video} />
        <Route path="/projects/:projectId" render={menuified(<Project />)} />
      </Switch >
    );
  }
}

export default App;
