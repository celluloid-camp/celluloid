import { Credentials, SigninErrors } from '@celluloid/types';
import { WithStyles, withStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import DialogAltButtons from 'components/DialogAltButtons';
import DialogButtons from 'components/DialogButtons';
import SigninError from 'components/DialogError';
import * as React from 'react';
import { AnyAction } from 'redux';
import { Action } from 'types/ActionTypes';

import { dialogStyles } from '../DialogStyles';

interface Props extends WithStyles<typeof dialogStyles> {
  credentials: Credentials;
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
        label="Nom complet ou email"
        required={true}
        value={credentials.login}
        className={classes.input}
        error={errors.login ? true : false}
        onChange={event => onChange('login', event.target.value)}
        helperText={errors && errors.login}
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
      <DialogAltButtons
        actionName="Mot de passe oublié ?"
        onSubmit={onClickResetPassword}
      />
      <DialogAltButtons
        heading="Pas encore de compte ?"
        actionName="S'inscrire"
        onSubmit={onClickSignup}
      />
      <DialogButtons onSubmit={onSubmit} actionName="Se connecter" />
    </div>
  )
);
