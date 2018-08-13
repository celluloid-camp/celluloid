import * as React from 'react';
import { AnyAction } from 'redux';
import { withStyles, WithStyles } from '@material-ui/core';

import TextField from '@material-ui/core/TextField';

import {
  SigninErrors,
  TeacherSignupData
} from '@celluloid/commons';
import { Action } from 'types/ActionTypes';
import SigninAction from '../SigninAction';
import SigninAltAction from '../SigninAltAction';
import SigninError from '../SigninError';
import { dialogStyles } from '../DialogStyles';

interface Props extends WithStyles<typeof dialogStyles> {
  data: TeacherSignupData;
  errors: SigninErrors;
  confirmPasswordError?: string;
  onChange(name: string, value: string): void;
  onClickLogin(): Action<null>;
  onSubmit(): Promise<AnyAction>;
}

export default withStyles(dialogStyles)(
  ({
    classes,
    data,
    errors,
    confirmPasswordError,
    onChange,
    onSubmit,
    onClickLogin
  }: Props) => (
    <div>
      <TextField
        error={errors.username ? true : false}
        label="Nom complet"
        value={data.username}
        required={true}
        className={classes.input}
        onChange={event => onChange('username', event.target.value)}
        helperText={errors && errors.username}
      />
      <TextField
        error={errors.email ? true : false}
        label="Email"
        value={data.email}
        required={true}
        className={classes.input}
        onChange={event => onChange('email', event.target.value)}
        helperText={errors.email}
      />
      <TextField
        error={errors.password ? true : false}
        label="Mot de passe"
        value={data.password}
        type="password"
        required={true}
        className={classes.input}
        onChange={event => onChange('password', event.target.value)}
        helperText={errors.password}
      />
      <TextField
        error={confirmPasswordError ? true : false}
        label="Confirmer le mot de passe"
        type="password"
        required={true}
        className={classes.input}
        onChange={event => onChange('confirmPassword', event.target.value)}
        helperText={confirmPasswordError}
      />
      {errors.server && <SigninError error={errors.server} />}
      <SigninAltAction
        heading="Déjà un compte ?"
        actionName="Se connecter"
        onSubmit={onClickLogin}
      />
      <SigninAction onSubmit={onSubmit} actionName="S'inscrire" />
    </div>
  )
);
