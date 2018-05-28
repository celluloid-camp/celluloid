import * as React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

import TeachersService from './services/Teachers';

import { TeacherCredentials, LoginValidation } from '../../common/src/types/Teacher';

interface Props {
  open: boolean;
  onClose(action: TeacherLoginAction, value: TeacherCredentials): Promise<{}>;
}

interface State {
  credentials: TeacherCredentials;
  result: LoginValidation;
  error?: string;
}

export enum TeacherLoginAction {
  None,
  Login,
  ForgotPassword,
  Signup
}

export default class TeacherLogin extends React.Component<
  Props, State
  > {

  state = {
    credentials: {
      email: '',
      password: '',
    },
    result: {
      success: true,
      errors: {}
    },
    error: undefined
  } as State;

  render() {

    const { open } = this.props;

    const onClose = (action: TeacherLoginAction) => (event: React.MouseEvent<HTMLElement>) => {
      this.props.onClose(action, this.state.credentials)
        .then(() => {
          this.setState({
            credentials: {
              email: '',
              password: '',
            },
            result: {
              success: true,
              errors: {}
            },
            error: undefined
          });
        });
    };

    const onLogin = (event: React.MouseEvent<HTMLElement>) => {
      TeachersService.login(
        this.state.credentials.email,
        this.state.credentials.password
      ).then((result: LoginValidation) => {
        if (result.success) {
          onClose(TeacherLoginAction.Login)(event);
        } else {
          this.setState({
            result,
            error: `Échec, veuillez vérifier le formulaire`
          });
        }
      }).catch(error => {

        this.setState({
          error: 'Échec, veuillez vérifier votre connexion Internet'
        });
      });
    };

    return (
      <Dialog
        open={open}
        fullWidth={true}
        onClose={onClose(TeacherLoginAction.None)}
      >
        <DialogTitle style={{ textAlign: 'center' }}>
          <span style={{ position: 'absolute', right: 16, top: 8 }}>
            <IconButton onClick={onClose(TeacherLoginAction.None)}>
              <CloseIcon />
            </IconButton>
          </span>
          {'Connexion'}
        </DialogTitle>
        <DialogContent style={{ padding: 16 }}>
          <TextField
            label="Email"
            required={true}
            error={this.state.result.errors && this.state.result.errors.email ? true : false}
            style={{ display: 'flex', flex: 1 }}
            onChange={event => {
              const state = this.state;
              state.credentials.email = event.target.value;
              this.setState(state);
            }}
            helperText={this.state.result.errors && this.state.result.errors.email}
          />
          <TextField
            label="Mot de passe"
            required={true}
            type="password"
            error={this.state.result.errors && this.state.result.errors.password ? true : false}
            style={{ display: 'flex', flex: 1 }}
            onChange={event => {
              const state = this.state;
              state.credentials.password = event.target.value;
              this.setState(state);
            }}
            helperText={this.state.result.errors && this.state.result.errors.password}
          />
          <div
            style={{
              justifyContent: 'center',
              display: 'flex',
              paddingTop: 16,
              flexWrap: 'wrap',
            }}
          >
            {this.state.error &&
              <Typography
                style={{
                  color: 'red',
                  fontWeight: 'bold'
                }}
              >
                {this.state.error}
              </Typography>
            }
          </div>
          <div
            style={{
              justifyContent: 'center',
              paddingBottom: 16,
              display: 'flex',
              flexWrap: 'wrap'
            }}
          >
            <Button
              onClick={onClose(TeacherLoginAction.ForgotPassword)}
              color="primary"
              variant="raised"
            >
              {`Mot de passe oublié`}
            </Button>
          </div>
        </DialogContent>
        <DialogActions style={{ textAlign: 'center' }}>
          <Button
            onClick={onLogin}
            color="primary"
            variant="raised"
          >
            {`Connexion`}
          </Button>
          <Button
            onClick={onClose(TeacherLoginAction.Signup)}
            color="primary"
            variant="raised"
          >
            {`Inscription`}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}