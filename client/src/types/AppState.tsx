import * as SigninDialog from 'components/Signin';

import {
  SigninErrors,
  TeacherRecord
} from '../../../common/src/types/TeacherTypes';

export type User = TeacherRecord;

export interface SigninState {
  loading: boolean;
  dialog: SigninDialog.DialogState;
  errors: SigninErrors;
  email?: string;
}

export interface AppState {
  user?: User;
  signin: SigninState;
}