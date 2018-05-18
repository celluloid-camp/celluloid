import * as React from 'react';
import { Route, Switch, NavLink, RouteComponentProps, withRouter } from 'react-router-dom';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import { WithStyles } from 'material-ui/styles/withStyles';
import IconButton from 'material-ui/IconButton';

import 'flag-icon-css/css/flag-icon.css';

import TeacherSignup, { TeacherSignupPayload, TeacherSignupAction } from './TeacherSignup';
import TeacherLogin, { TeacherLoginAction } from './TeacherLogin';
import Home from './Home';
import Project from './Project';
import Video from './Video';

import TeachersService from './services/Teachers';

import { MaybeWithTeacher } from './types/Teacher';

import { TeacherCredentials, TeacherRecord } from '../../common/src/types/Teacher';

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

interface State {
  signupOpen: boolean;
  loginOpen: boolean;
  teacher?: TeacherRecord;
}

const menuified = (<P extends MaybeWithTeacher>(Child: React.ComponentType<P>) =>
  class Menu extends React.Component<Props & WithStyles<'grow' | 'largeBar'>, State> {

    state = {
      signupOpen: false,
      loginOpen: false,
    } as State;

    getTeacher() {
      TeachersService.me().then(result => {
        if (result.teacher) {
          this.setState({ teacher: result.teacher });
        }
      }).catch(err => null);
    }

    componentWillMount() {
      this.getTeacher();
    }

    render() {
      const showLogin = () => {
        this.setState({ loginOpen: true });
      };

      const showSignup = () => {
        this.setState({ signupOpen: true });
      };

      const closeLogin = (action: TeacherLoginAction, value: TeacherCredentials) => {
        this.setState({ signupOpen: false });
        this.setState({ loginOpen: false });
        switch (action) {
          case TeacherLoginAction.Login:
            this.getTeacher();
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
            this.getTeacher();
            break;
          case TeacherSignupAction.None:
            break;
          default:
            break;
        }
        return Promise.resolve({});
      };

      const logout = () => {
        TeachersService.logout().then(() => {
          this.setState({ teacher: undefined });
        })
          .catch(err => null);
      };

      const renderLoginBar = () => {
        if (this.state.teacher) {
          const name = this.state.teacher.firstName;
          const email = this.state.teacher.email;
          return (
            <div>
              <Button
                color="primary"
              >
                {name ? name : email}
              </Button>
              <Button
                onClick={logout}
                color="primary"
              >
                {`Deconnexion`}
              </Button>
            </div>
          );
        } else {
          return (
            <div>
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
            </div>
          );
        }
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
              {renderLoginBar()}
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
            <Child {...this.props} teacher={this.state.teacher}/>
          </div>
        </div>
      );
    }
  }
);

class App extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact={true} path="/" component={withRouter(decorate<Props>(menuified(Home)))} />
        <Route path="/projects/:projectId/video" component={Video} />
        <Route path="/projects/:projectId" component={withRouter(decorate<Props>(menuified(Project)))} />
      </Switch >
    );
  }
}

export default App;
