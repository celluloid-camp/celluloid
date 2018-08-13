import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'scenes/Home';
import Project from 'scenes/Project';
import { withMenu } from 'scenes/Menu';
import About from 'components/About';
import LegalNotice from 'components/LegalNotice';
import TermsAndConditions from 'components/TermsAndConditions';

class App extends React.Component {
  render() {
    return (
      <Switch>
        <Route
          exact={true}
          path="/"
          component={withMenu(Home)}
        />
        <Route
          exact={true}
          path="/about"
          component={withMenu(About)}
        />
        <Route
          exact={true}
          path="/legal-notice"
          component={withMenu(LegalNotice)}
        />
        <Route
          exact={true}
          path="/terms-and-conditions"
          component={withMenu(TermsAndConditions)}
        />
        <Route
          path="/projects/:projectId"
          component={withMenu(Project)}
        />
      </Switch>
    );
  }
}

export default App;
