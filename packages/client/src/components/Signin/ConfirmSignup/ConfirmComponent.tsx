import { SigninErrors, TeacherConfirmData } from '@celluloid/types';
import { TextField } from '@material-ui/core';
import DialogAltButtons from 'components/DialogAltButtons';
import DialogButtons from 'components/DialogButtons';
import SigninError from 'components/DialogError';
import * as React from 'react';
import { AnyAction } from 'redux';

interface Props {
  data: TeacherConfirmData;
  errors: SigninErrors;
  onChange(name: string, value: string): void;
  onClickResend(): Promise<AnyAction>;
  onSubmit(): Promise<AnyAction>;
}

export default ({
  data,
  errors,
  onChange,
  onClickResend,
  onSubmit
}: Props) => (
    <div>
      <TextField
        margin="dense"
        fullWidth={true}
        label="Email ou nom complet"
        required={true}
        value={data.login}
        error={errors.login ? true : false}
        onChange={event => onChange('login', event.target.value)}
        helperText={errors.login}
      />
      <TextField
        margin="dense"
        fullWidth={true}
        label="Code de confirmation"
        required={true}
        value={data.code}
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
  );
