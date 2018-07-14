import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'Home';
import Project from 'Project';
import Video from 'Video';
import { withMenu } from 'components/Menu';
class App extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact={true} path="/" component={withMenu(Home)} />
        <Route path="/projects/:projectId/video" component={Video} />
        <Route path="/projects/:projectId" component={withMenu(Project)} />
      </Switch>
    );
  }
}

export default App;
