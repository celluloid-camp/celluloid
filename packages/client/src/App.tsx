import { createStyles, WithStyles, withStyles } from '@material-ui/core';
import About from 'components/About';
import LegalNotice from 'components/LegalNotice';
import NotFound from 'components/NotFound';
import TermsAndConditions from 'components/TermsAndConditions';
import UpdateIndicator from 'components/UpdateIndicator';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'scenes/Home';
import { withMenu } from 'scenes/Menu';
import Project from 'scenes/Project';
import ShareGuide from 'scenes/ShareGuide';

const styles = createStyles({
  '@global': {
    a: {
      color: '#42a6f5'
    }
  },
});

interface Props extends WithStyles<typeof styles> {
}

export default
  withStyles(styles)(
    class extends React.Component<Props> {
      render() {
        return (
          <>
            <UpdateIndicator />
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
              <Route
                path="/shares/:projectId"
                component={ShareGuide}
              />
              <Route component={withMenu(NotFound)} />
            </Switch>
          </>
        );
      }
    }
  );