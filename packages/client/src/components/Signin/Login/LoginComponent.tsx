import { Credentials, SigninErrors } from '@celluloid/types';
import TextField from '@material-ui/core/TextField';
import DialogAltButtons from 'components/DialogAltButtons';
import DialogButtons from 'components/DialogButtons';
import SigninError from 'components/DialogError';
import * as React from 'react';
import { AnyAction } from 'redux';
import { Action } from 'types/ActionTypes';

interface Props {
  credentials: Credentials;
  errors: SigninErrors;
  onChange(name: string, value: string): void;
  onClickResetPassword(): Action<null>;
  onClickSignup(): Action<null>;
  onSubmit(): Promise<AnyAction>;
}

export default ({
  credentials,
  errors,
  onChange,
  onClickResetPassword,
  onClickSignup,
  onSubmit
}: Props) => (
    <div>
      <TextField
        margin="dense"
        fullWidth={true}
        label="Nom complet ou email"
        required={true}
        id="username"
        value={credentials.login}
        error={errors.login ? true : false}
        onChange={event => onChange('login', event.target.value)}
        helperText={errors && errors.login}
      />
      <TextField
        margin="dense"
        fullWidth={true}
        label="Mot de passe"
        required={true}
        value={credentials.password}
        type="password"
        error={errors.password ? true : false}
        onChange={event => onChange('password', event.target.value)}
        helperText={errors && errors.password}
      />
      {errors.server && <SigninError error={errors.server} />}

      <DialogAltButtons
        heading="Pas encore de compte ?"
        actionName="S'inscrire"
        onSubmit={onClickSignup}
      />
      <DialogAltButtons
        actionName="Mot de passe oublié"
        onSubmit={onClickResetPassword}
      />
      <DialogButtons onSubmit={onSubmit} actionName="Se connecter" />
    </div>
  );
