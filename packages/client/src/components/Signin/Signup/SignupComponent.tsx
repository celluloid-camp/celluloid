import { YoutubeVideo } from 'types/YoutubeTypes';
import { SigninErrors, TeacherSignupData, UserRecord } from '@celluloid/types';
import { Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import DialogAltButtons from 'components/DialogAltButtons';
import DialogButtons from 'components/DialogButtons';
import DialogError from 'components/DialogError';
import * as React from 'react';
import { AnyAction } from 'redux';
import { Action } from 'types/ActionTypes';

interface Props {
  user?: UserRecord;
  video?: YoutubeVideo;
  data: TeacherSignupData;
  errors: SigninErrors;
  confirmPasswordError?: string;
  onChange(name: string, value: string): void;
  onClickLogin(): Action<null>;
  onSubmit(): Promise<AnyAction>;
}

export default ({
  data,
  user,
  video,
  errors,
  confirmPasswordError,
  onChange,
  onSubmit,
  onClickLogin
}: Props) => (
    <div>
      {(video && user) &&
        <Typography gutterBottom={true} variant="subtitle2" color="primary">
          {`Pour continuer, vous devez renseigner un email et un mot de passe`}
        </Typography>
      }
      {(video && !user) &&
        <Typography gutterBottom={true} variant="subtitle2" color="primary">
          {`Pour continuer, vous devez vous inscrire ou vous connecter`}
        </Typography>
      }
      <TextField
        margin="dense"
        fullWidth={true}
        error={errors.username ? true : false}
        label="Nom complet"
        value={data.username}
        required={true}
        onChange={event => onChange('username', event.target.value)}
        helperText={errors && errors.username}
      />
      <TextField
        margin="dense"
        fullWidth={true}
        error={errors.email ? true : false}
        label="Email"
        value={data.email}
        required={true}
        onChange={event => onChange('email', event.target.value)}
        helperText={errors.email}
      />
      <TextField
        margin="dense"
        fullWidth={true}
        error={errors.password ? true : false}
        label="Mot de passe"
        value={data.password}
        type="password"
        required={true}
        onChange={event => onChange('password', event.target.value)}
        helperText={errors.password}
      />
      <TextField
        margin="dense"
        fullWidth={true}
        error={confirmPasswordError ? true : false}
        label="Confirmer le mot de passe"
        type="password"
        required={true}
        onChange={event => onChange('confirmPassword', event.target.value)}
        helperText={confirmPasswordError}
      />
      {errors.server && <DialogError error={errors.server} />}
      {!user &&
        <DialogAltButtons
          heading="Déjà un compte ?"
          actionName="Se connecter"
          onSubmit={onClickLogin}
        />
      }
      <DialogButtons onSubmit={onSubmit} actionName="S'inscrire" />
    </div>
  );
