import { SigninErrors, TeacherConfirmResetPasswordData } from '@celluloid/types';
import DialogButtons from 'components/DialogButtons';
import DialogError from 'components/DialogError';
import * as React from 'react';
import { AnyAction } from 'redux';
import { TextField } from '@material-ui/core';

interface Props {
  data: TeacherConfirmResetPasswordData;
  errors: SigninErrors;
  confirmPasswordError?: string;
  onChange(name: string, value: string): void;
  onSubmit(): Promise<AnyAction>;
}

export default ({
  data,
  errors,
  confirmPasswordError,
  onChange,
  onSubmit,
}: Props) => (
    <div>
      <TextField
        fullWidth={true}
        margin="dense"
        label="Email ou nom complet"
        required={true}
        value={data.login}
        error={errors.email ? true : false}
        onChange={event => onChange('login', event.target.value)}
        helperText={errors && errors.login}
      />
      <TextField
        fullWidth={true}
        margin="dense"
        label="Code de confirmation"
        required={true}
        value={data.code}
        error={errors.code ? true : false}
        onChange={event => onChange('code', event.target.value)}
        helperText={
          errors.code ? errors.code : 'Ce code vous a été envoyé par email'
        }
      />
      <TextField
        fullWidth={true}
        margin="dense"
        label="Mot de passe"
        required={true}
        value={data.password}
        type="password"
        error={errors.password ? true : false}
        onChange={event => onChange('password', event.target.value)}
        helperText={errors && errors.password}
      />
      <TextField
        fullWidth={true}
        margin="dense"
        error={confirmPasswordError ? true : false}
        label="Confirmer le mot de passe"
        type="password"
        required={true}
        onChange={event => onChange('confirmPassword', event.target.value)}
        helperText={confirmPasswordError}
      />
      {errors.server && <DialogError error={errors.server} />}
      <DialogButtons onSubmit={onSubmit} actionName="Mettre à jour" />
    </div>
  );
