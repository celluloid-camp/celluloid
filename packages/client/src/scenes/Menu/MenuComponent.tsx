import * as React from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'react-redux';
import createStyles from '@material-ui/core/styles/createStyles';
import { NavLink, Link, RouteComponentProps } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import SigninDialog, { SigninState } from 'components/Signin';
import { WithLogin } from 'types/Teacher';
import SigninBar from './components/SigninBar';
import { AppState, User } from 'types/AppState';
import { openLogin, openSignup, closeSignin } from 'actions/Signin';
import { Action } from 'types/Action';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

interface ChildProps extends WithLogin { }

const styles = (theme: Theme) => createStyles({
  root: { height: '100%' },
  grow: { flex: 1 },
  homeLink: { textDecoration: 'none' },
  content: {
    paddingTop: 64,
    height: '100%'
  },
  footer: {
    width: '100%',
    textAlign: 'center',
    marginBottom: 72
  },
  footerLink: {
    ...theme.typography.caption,
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

interface Props extends RouteComponentProps<{}>, WithStyles<typeof styles> {
  user?: User;
  signinDialog: SigninState;

  Content: React.ComponentType<ChildProps>;
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
      signinDialog,
      ...others
    } = props;

    // tslint:disable-next-line:no-any
    const AboutLink = (buttonProps: any) => <Link to="/about" {...buttonProps} />;

    return (
      <div className={classes.root}>
        <AppBar color="default">
          <Toolbar>
            <div className={classes.grow}>
              <NavLink to="/" className={classes.homeLink}>
                <Typography variant="display1">
                  <b>{`Celluloid`}</b>
                </Typography>
              </NavLink>
            </div>
            <Button color="secondary">{`fr`}</Button>
            <Button
              component={AboutLink}
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
          <Content teacher={user} {...others} />
        </div>
        <div className={classes.footer}>
            <Typography variant="caption">
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
