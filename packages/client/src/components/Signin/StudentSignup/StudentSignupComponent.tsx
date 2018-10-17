import { SigninErrors, StudentSignupData } from '@celluloid/types';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import DialogAltButtons from 'components/DialogAltButtons';
import DialogButtons from 'components/DialogButtons';
import DialogError from 'components/DialogError';
import * as React from 'react';
import { AnyAction } from 'redux';
import { Action } from 'types/ActionTypes';

const styles = ({ spacing }: Theme) => createStyles({
  question: {
    marginTop: spacing.unit * 2
  }
});

interface Props extends WithStyles<typeof styles> {
  data: StudentSignupData;
  errors: SigninErrors;
  confirmPasswordError?: string;
  onChange(name: string, value: string): void;
  onClickLogin(): Action<null>;
  onSubmit(): Promise<AnyAction>;
}

export default withStyles(styles)(
  ({
    classes,
    data,
    errors,
    onChange,
    onSubmit,
    onClickLogin
  }: Props) => (
      <>
        <TextField
          margin="dense"
          fullWidth={true}
          error={errors.username ? true : false}
          label="Code du projet"
          value={data.shareCode}
          required={true}
          onChange={event => onChange('shareCode', event.target.value)}
          helperText={errors && errors.shareCode}
        />
        <TextField
          margin="dense"
          fullWidth={true}
          error={errors.email ? true : false}
          label="Nom complet ou pseudo"
          value={data.username}
          required={true}
          onChange={event => onChange('username', event.target.value)}
          helperText={errors.username}
        />
        <TextField
          className={classes.question}
          margin="dense"
          fullWidth={true}
          error={errors.password ? true : false}
          label="Question secrète"
          value={data.passwordHint}
          required={true}
          onChange={event => onChange('passwordHint', event.target.value)}
          helperText={errors.passwordHint}
        />
        <TextField
          margin="dense"
          fullWidth={true}
          error={errors.password ? true : false}
          label="Réponse à la question"
          value={data.password}
          required={true}
          onChange={event => onChange('password', event.target.value)}
          helperText={errors.password ? errors.password : '8 caractères minimum'}
        />
        <DialogError error="Attention ! Cette réponse sert de mot de passe et ne pourra pas être récupérée !" />
        {errors.server && <DialogError error={errors.server} />}
        <DialogAltButtons
          heading="Déjà un compte ?"
          actionName="Se connecter"
          onSubmit={onClickLogin}
        />
        <DialogButtons onSubmit={onSubmit} actionName="Rejoindre" />
      </>
    )
);
