import * as React from 'react';
import { AnyAction } from 'redux';
import { withStyles, WithStyles } from '@material-ui/core';

import TextField from '@material-ui/core/TextField';

import {
  SigninErrors,
  TeacherConfirmData
} from '@celluloid/commons';
import SigninAction from '../SigninAction';
import SigninAltAction from '../SigninAltAction';
import SigninError from '../SigninError';
import { dialogStyles } from '../DialogStyles';

interface Props extends WithStyles<typeof dialogStyles> {
  data: TeacherConfirmData;
  errors: SigninErrors;
  onChange(name: string, value: string): void;
  onClickResend(): Promise<AnyAction>;
  onSubmit(): Promise<AnyAction>;
}

export default withStyles(dialogStyles)(
  ({ classes, data, errors, onChange, onClickResend, onSubmit }: Props) => (
    <div>
      <TextField
        label="Email"
        required={true}
        value={data.email}
        className={classes.input}
        error={errors.email ? true : false}
        onChange={event => onChange('email', event.target.value)}
        helperText={errors.email}
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
      {errors.server && <SigninError error={errors.server} />}
      <SigninAltAction
        actionName="Envoyer un nouveau code"
        onSubmit={onClickResend}
      />
      <SigninAction onSubmit={onSubmit} actionName="Confirmer l'inscription" />
    </div>
  )
);
