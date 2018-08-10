import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'scenes/Home';
import Project from 'scenes/Project';
import { withMenu } from 'scenes/Menu';

class App extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact={true} path="/" component={withMenu(Home)} />
        <Route path="/projects/:projectId" component={withMenu(Project)} />
      </Switch>
    );
  }
}

export default App;
