import * as React from 'react';

import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
  InjectedProps
} from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';

import CloseIcon from 'material-ui-icons/Close';

import TeachersService from './services/Teachers';

import { TeacherCredentials, LoginValidation } from '../../common/src/types/Teacher';

interface Props {
  isOpen: boolean;
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
  Props & InjectedProps, State
  > {

  state = {
    credentials: {
      email: '',
      password: '',
    },
    result: {
      success: true,
      errors: {
        email: undefined,
        password: undefined
      }
    },
    error: undefined
  };

  render() {

    const { fullScreen, isOpen } = this.props;

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
        fullScreen={fullScreen}
        open={isOpen}
        fullWidth={true}
      >
        <DialogTitle style={{ textAlign: 'center' }}>
          <span style={{ position: 'absolute', right: 16, top: 8 }}>
            <IconButton onClick={onClose(TeacherLoginAction.None)}>
              <CloseIcon />
            </IconButton>
          </span>
          {'Connexion'}
        </DialogTitle>
        <DialogContent style={{padding: 16}}>
          <TextField
            label="Email"
            required={true}
            error={this.state.result.errors.email ? true : false}
            style={{ display: 'flex', flex: 1 }}
            onChange={event => {
              const state = this.state;
              state.credentials.email = event.target.value;
              this.setState(state);
            }}
            helperText={this.state.result.errors.email}
          />
          <TextField
            label="Mot de passe"
            required={true}
            type="password"
            error={this.state.result.errors.password ? true : false}
            style={{ display: 'flex', flex: 1 }}
            onChange={event => {
              const state = this.state;
              state.credentials.password = event.target.value;
              this.setState(state);
            }}
            helperText={this.state.result.errors.password}
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
              raised={false}
            >
              {`Mot de passe oublié`}
            </Button>
          </div>
        </DialogContent>
        <DialogActions style={{ textAlign: 'center' }}>
          <Button
            onClick={onLogin}
            color="primary"
            raised={true}
          >
            {`Connexion`}
          </Button>
          <Button
            onClick={onClose(TeacherLoginAction.Signup)}
            color="primary"
            raised={false}
          >
            {`Inscription`}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}