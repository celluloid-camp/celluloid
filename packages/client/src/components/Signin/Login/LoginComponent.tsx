import * as React from 'react';
import { AnyAction } from 'redux';

import { Action } from 'types/ActionTypes';
import TextField from '@material-ui/core/TextField';

import {
  SigninErrors,
  TeacherCredentials
} from '@celluloid/commons';
import { withStyles, WithStyles } from '@material-ui/core';
import SigninAction from '../SigninAction';
import SigninAltAction from '../SigninAltAction';
import SigninError from '../SigninError';
import { dialogStyles } from '../DialogStyles';

interface Props extends WithStyles<typeof dialogStyles> {
  credentials: TeacherCredentials;
  errors: SigninErrors;
  onChange(name: string, value: string): void;
  onClickResetPassword(): Action<null>;
  onClickSignup(): Action<null>;
  onSubmit(): Promise<AnyAction>;
}

export default withStyles(dialogStyles)(
  ({
    classes,
    credentials,
    errors,
    onChange,
    onClickResetPassword,
    onClickSignup,
    onSubmit
  }: Props) => (
    <div>
      <TextField
        label="Email"
        required={true}
        value={credentials.email}
        className={classes.input}
        error={errors.email ? true : false}
        onChange={event => onChange('email', event.target.value)}
        helperText={errors && errors.email}
      />
      <TextField
        label="Mot de passe"
        required={true}
        value={credentials.password}
        type="password"
        className={classes.input}
        error={errors.password ? true : false}
        onChange={event => onChange('password', event.target.value)}
        helperText={errors && errors.password}
      />
      {errors.server && <SigninError error={errors.server} />}
      <SigninAltAction
        actionName="Mot de passe oublié ?"
        onSubmit={onClickResetPassword}
      />
      <SigninAltAction
        heading="Pas encore de compte ?"
        actionName="S'inscrire"
        onSubmit={onClickSignup}
      />
      <SigninAction onSubmit={onSubmit} actionName="Se connecter" />
    </div>
  )
);
