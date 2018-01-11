import * as React from 'react';
import { Route, Switch, NavLink } from 'react-router-dom';

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

const decorate = withStyles(({ palette, spacing }) => ({
  grow: {
    flex: 1
  },
  largeBar: {
    height: '80px'
  },
}));

const Menu = decorate<{}>(
  class extends React.Component<
    WithStyles<'grow'>
    & WithStyles<'largeBar'>
    > {
    render() {

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
              <Button>À propos</Button>
              <Button>Inscription</Button>
              <Button color="primary">Connexion</Button>
            </Toolbar>
          </AppBar >
          <div style={{ paddingTop: 100 }}>
            <Switch>
              <Route exact={true} path="/" component={Home} />
              <Route path="/projects/:projectId/video" component={Video} />
              <Route path="/projects/:projectId" component={Project} />
            </Switch >
          </div>
        </div >
      );
    }
  }
);

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
