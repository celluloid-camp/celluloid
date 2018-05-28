import * as React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import TeachersService from './services/Teachers';

import CloseIcon from '@material-ui/icons/Close';

import { MouseEvent } from 'react';
import { NewProjectData } from '../../common/src/types/Project';
import { NewTeacherData, SignupValidation } from '../../common/src/types/Teacher';

interface Props {
  open: boolean;
  project?: NewProjectData;
  onClose(action: TeacherSignupAction, value: TeacherSignupPayload): Promise<{}>;
}

export interface TeacherSignupPayload {
  project?: NewProjectData;
  teacher: NewTeacherData;
}

export enum TeacherSignupAction {
  None,
  Signup,
  Login
}

interface State {
  teacher: NewTeacherData;
  confirmPassword: string;
  result: SignupValidation;
  confirmError: boolean;
  error?: string;
}

export default class TeacherSignup extends React.Component<
  Props, State
  > {

  state = {
    teacher: {
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
    confirmPassword: '',
    confirmError: false,
    error: undefined
  };

  render() {

    const { open, project } = this.props;

    const onClose = (action: TeacherSignupAction) => (event: MouseEvent<HTMLElement>) => {
      this.props.onClose(action, {
        project,
        teacher: this.state.teacher
      }).then(() => {
        this.setState({
          teacher: {
            email: '',
            password: ''
          },
          result: {
            success: true,
            errors: {
              email: undefined,
              password: undefined
            }
          },
          confirmPassword: '',
          confirmError: false,
          error: undefined
        });
      });
    };

    const onSignup = (event: MouseEvent<HTMLElement>) => {
      TeachersService.signup(
        this.state.teacher.email,
        this.state.teacher.password
      ).then((result: SignupValidation) => {
        if (result.success) {
          onClose(TeacherSignupAction.Login)(event);
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

    const checkConfirm = (state: State) => {
      return !(state.confirmPassword === state.teacher.password);
    };

    return (
      <Dialog
        onClick={onClose(TeacherSignupAction.None)}
        open={open}
        fullWidth={true}
      >
        <DialogTitle style={{ textAlign: 'center' }}>
          <span style={{ position: 'absolute', right: 16, top: 8 }}>
            <IconButton
              onClick={onClose(TeacherSignupAction.None)}
            >
              <CloseIcon />
            </IconButton>
          </span>
          {'Inscription'}
        </DialogTitle>
        <DialogContent>
          <TextField
            error={this.state.result.errors.email ? true : false}
            label="Email"
            required={true}
            style={{ display: 'flex', flex: 1 }}
            onChange={event => {
              const state = this.state;
              state.teacher.email = event.target.value;
              this.setState(state);
            }}
            helperText={this.state.result.errors.email}
          />
          <TextField
            error={this.state.result.errors.password ? true : false}
            label="Mot de passe"
            type="password"
            required={true}
            style={{ display: 'flex', flex: 1 }}
            onChange={event => {
              const state = this.state;
              state.teacher.password = event.target.value;
              state.confirmError = checkConfirm(state);
              this.setState(state);
            }}
            helperText={this.state.result.errors.password}
          />
          <TextField
            error={this.state.confirmError}
            label="Confirmer le mot de passe"
            type="password"
            required={true}
            style={{ display: 'flex', flex: 1 }}
            onChange={event => {
              const state = this.state;
              state.confirmPassword = event.target.value;
              state.confirmError = checkConfirm(state);
              this.setState(state);
            }}
            helperText={this.state.confirmError ?
              'Les mots de passe ne correspondent pas'
              : undefined
            }
          />
          <div
            style={{
              justifyContent: 'center',
              display: 'flex',
              paddingTop: 16,
              paddingBottom: 16,
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
        </DialogContent>
        <DialogActions style={{ textAlign: 'center' }}>
          <Button
            onClick={onSignup}
            color="primary"
            variant="raised"
            disabled={this.state.confirmError}
          >
            {`Inscription`}
          </Button>
          <Button
            onClick={onClose(TeacherSignupAction.Login)}
            color="primary"
            variant="raised"
          >
            {`Connexion`}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}