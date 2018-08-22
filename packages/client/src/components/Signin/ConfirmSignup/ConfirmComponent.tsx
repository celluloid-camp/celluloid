import { SigninErrors, TeacherConfirmData } from '@celluloid/types';
import { WithStyles, withStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import DialogAltButtons from 'components/DialogAltButtons';
import DialogButtons from 'components/DialogButtons';
import SigninError from 'components/DialogError';
import * as React from 'react';
import { AnyAction } from 'redux';

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
        label="Email ou nom complet"
        required={true}
        value={data.login}
        className={classes.input}
        error={errors.login ? true : false}
        onChange={event => onChange('login', event.target.value)}
        helperText={errors.login}
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
      <DialogAltButtons
        actionName="Envoyer un nouveau code"
        onSubmit={onClickResend}
      />
      <DialogButtons onSubmit={onSubmit} actionName="Confirmer l'inscription" />
    </div>
  )
);
