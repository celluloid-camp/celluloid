import * as React from 'react';
import { AnyAction } from 'redux';

import TextField from '@material-ui/core/TextField';

import {
  SigninErrors
} from '../../../../../common/src/types/TeacherTypes';
import { withStyles, WithStyles } from '@material-ui/core';
import SigninAction from '../SigninAction';
import SigninError from '../SigninError';
import { dialogStyles } from '../DialogStyles';

interface Props extends WithStyles<typeof dialogStyles> {
  email: string;
  errors: SigninErrors;
  onChange(value: string): void;
  onSubmit(): Promise<AnyAction>;
}

export default withStyles(dialogStyles)(
  ({
    classes,
    email,
    errors,
    onChange,
    onSubmit,
  }: Props) => (
    <div>
      <TextField
        label="Email"
        required={true}
        value={email}
        className={classes.input}
        error={errors.email ? true : false}
        onChange={event => onChange(event.target.value)}
        helperText={errors && errors.email}
      />
      {errors.server && <SigninError error={errors.server} />}
      <SigninAction onSubmit={onSubmit} actionName="Changer le mot de passe" />
    </div>
  )
);
