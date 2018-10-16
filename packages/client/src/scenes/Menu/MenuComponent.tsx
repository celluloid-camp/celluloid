import { UserRecord } from '@celluloid/types';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { closeSignin, openLogin, openSignup } from 'actions/Signin';
import { getButtonLink } from 'components/ButtonLink';
import SigninDialog, { SigninState } from 'components/Signin';
import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { AnyAction, Dispatch } from 'redux';
import { Action } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';

import SigninBar from './components/SigninBar';

const styles = ({ typography, spacing, palette }: Theme) => createStyles({
  root: { height: '100%' },
  grow: { flex: 1 },
  homeLink: {
    color: palette.grey[600],
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    fontFamily: typography.h4.fontFamily,
    textTransform: 'none',
    textDecoration: 'none'
  },
  content: {
    paddingTop: spacing.unit * 8,
    height: '100%'
  },
  footer: {
    paddingTop: spacing.unit * 3,
    width: '100%',
    textAlign: 'center',
    marginBottom: spacing.unit * 9
  },
  copyright: {
    color: palette.grey[600]
  },
  footerLink: {
    ...typography.caption,
    color: palette.grey[600],
    display: 'inline',
    textDecoration: 'underline'
  }
});

const mapStateToProps = (state: AppState) => {
  return {
    user: state.user,
    signinDialog: state.signin.dialog
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onClickLogin: () => dispatch(openLogin()),
    onClickSignup: () => dispatch(openSignup()),
    onCloseSignin: () => dispatch(closeSignin())
  };
};

interface Props extends WithStyles<typeof styles> {
  user?: UserRecord;
  signinDialog: SigninState;
  Content: React.ComponentType;
  onClickLogin(): Action<null>;
  onClickSignup(): Action<null>;
  onCloseSignin(): Action<null>;
  onClickLogout(): Promise<AnyAction>;
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )((props: Props) => {
    const {
      classes,
      user,
      onClickLogin,
      onClickSignup,
      onClickLogout,
      onCloseSignin,
      Content,
      signinDialog
    } = props;

    return (
      <div className={classes.root}>
        <AppBar color="default">
          <Toolbar>
            <div className={classes.grow}>
              <Button
                component={getButtonLink('/')}
                className={classes.homeLink}
              >
                <b>{`Celluloid`}</b>
              </Button>
            </div>
            <Button color="secondary">{`fr`}</Button>
            <Button
              component={getButtonLink('/About')}
            >
              {`À propos`}
            </Button>
            <SigninBar
              user={user}
              onClickLogin={onClickLogin}
              onClickSignup={onClickSignup}
              onClickLogout={onClickLogout}
            />
          </Toolbar>
        </AppBar>
        <SigninDialog onCancel={onCloseSignin} state={signinDialog} />
        <div className={classes.content}>
          <Content />
        </div>
        <div className={classes.footer}>
          <Typography variant="caption" className={classes.copyright}>
            {`© 2018 Institut Catholique de Paris`}
          </Typography>
          <NavLink to="/terms-and-conditions" className={classes.footerLink}>
            {`Conditions Générales d'utilisation`}
          </NavLink>
          {` - `}
          <NavLink to="/legal-notice" className={classes.footerLink}>
            {`Mentions Légales`}
          </NavLink>
        </div>
      </div >
    );
  })
);
