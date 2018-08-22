import { SigninErrors } from '@celluloid/types';
import { WithStyles, withStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import DialogButtons from 'components/DialogButtons';
import SigninError from 'components/DialogError';
import * as React from 'react';
import { AnyAction } from 'redux';

import { dialogStyles } from '../DialogStyles';

interface Props extends WithStyles<typeof dialogStyles> {
  login: string;
  errors: SigninErrors;
  onChange(value: string): void;
  onSubmit(): Promise<AnyAction>;
}

export default withStyles(dialogStyles)(
  ({
    classes,
    login,
    errors,
    onChange,
    onSubmit,
  }: Props) => (
    <div>
      <TextField
        label="Email ou nom complet"
        required={true}
        value={login}
        className={classes.input}
        error={errors.login ? true : false}
        onChange={event => onChange(event.target.value)}
        helperText={errors && errors.login}
      />
      {errors.server && <SigninError error={errors.server} />}
      <DialogButtons onSubmit={onSubmit} actionName="Changer le mot de passe" />
    </div>
  )
);
