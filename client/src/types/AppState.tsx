import * as SigninDialog from 'components/Signin';

import {
  LoginErrors,
  SignupErrors,
  TeacherRecord
} from '../../../common/src/types/Teacher';

export type User = TeacherRecord;

export interface LoginState {
  errors?: LoginErrors;
}

export interface SingupState {
  errors?: SignupErrors;
}

export interface SigninState {
  dialog: SigninDialog.DialogState;
  login: LoginState;
  signup: SingupState;
}

export interface AppState {
  user?: User;
  signin: SigninState;
}