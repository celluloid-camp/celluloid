import * as React from 'react';
import { AnyAction } from 'redux';

import TextField from '@material-ui/core/TextField';

import {
  SigninErrors,
  TeacherConfirmResetPasswordData
} from '@celluloid/commons';
import { withStyles, WithStyles } from '@material-ui/core';
import SigninAction from '../SigninAction';
import SigninError from '../SigninError';
import { dialogStyles } from '../DialogStyles';

interface Props extends WithStyles<typeof dialogStyles> {
  data: TeacherConfirmResetPasswordData;
  errors: SigninErrors;
  confirmPasswordError?: string;
  onChange(name: string, value: string): void;
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
  }: Props) => (
    <div>
      <TextField
        label="Email"
        required={true}
        value={data.email}
        className={classes.input}
        error={errors.email ? true : false}
        onChange={event => onChange('email', event.target.value)}
        helperText={errors && errors.email}
      />
      <TextField
        label="Code de confirmation"
        required={true}
        value={data.code}
        className={classes.input}
        error={errors.code ? true : false}
        onChange={event => onChange('code', event.target.value)}
        helperText={
          errors.code ? errors.code : 'Ce code vous a été envoyé par email'
        }
      />
      <TextField
        label="Mot de passe"
        required={true}
        value={data.password}
        type="password"
        className={classes.input}
        error={errors.password ? true : false}
        onChange={event => onChange('password', event.target.value)}
        helperText={errors && errors.password}
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
      <SigninAction onSubmit={onSubmit} actionName="Mettre à jour" />
    </div>
  )
);
