import { SigninErrors, StudentSignupData } from '@celluloid/types';
import { WithStyles, withStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import DialogAltButtons from 'components/DialogAltButtons';
import DialogButtons from 'components/DialogButtons';
import DialogError from 'components/DialogError';
import * as React from 'react';
import { AnyAction } from 'redux';
import { Action } from 'types/ActionTypes';

import { dialogStyles } from '../DialogStyles';

interface Props extends WithStyles<typeof dialogStyles> {
  data: StudentSignupData;
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
    onChange,
    onSubmit,
    onClickLogin
  }: Props) => (
    <div>
      <TextField
        error={errors.username ? true : false}
        label="Code du projet"
        value={data.projectShareName}
        required={true}
        className={classes.input}
        onChange={event => onChange('projectShareName', event.target.value)}
        helperText={errors && errors.projectShareName}
      />
      <TextField
        error={errors.username ? true : false}
        label="Mot de passe du projet"
        value={data.projectSharePassword}
        required={true}
        className={classes.input}
        onChange={event => onChange('projectSharePassword', event.target.value)}
        helperText={errors && errors.projectSharePassword}
      />
      <TextField
        error={errors.email ? true : false}
        label="Nom complet"
        value={data.username}
        required={true}
        className={classes.input}
        onChange={event => onChange('username', event.target.value)}
        helperText={errors.username}
      />
      <TextField
        error={errors.password ? true : false}
        label="Question secrète"
        value={data.passwordHint}
        required={true}
        className={classes.input}
        onChange={event => onChange('passwordHint', event.target.value)}
        helperText={errors.passwordHint}
      />
      <TextField
        error={errors.password ? true : false}
        label="Réponse à la question"
        value={data.password}
        required={true}
        className={classes.input}
        onChange={event => onChange('password', event.target.value)}
        helperText={
          errors.password ?
          errors.password :
          'Attention, cette réponse sert de mot de passe et ne peut être récupérée'
        }
      />
      {errors.server && <DialogError error={errors.server} />}
      <DialogAltButtons
        heading="Déjà un compte ?"
        actionName="Se connecter"
        onSubmit={onClickLogin}
      />
      <DialogButtons onSubmit={onSubmit} actionName="Rejoindre" />
    </div>
  )
);
