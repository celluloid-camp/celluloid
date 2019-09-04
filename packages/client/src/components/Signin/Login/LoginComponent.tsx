import { Credentials, SigninErrors } from '@celluloid/types';
import TextField from '@material-ui/core/TextField';
import DialogAltButtons from 'components/DialogAltButtons';
import DialogButtons from 'components/DialogButtons';
import SigninError from 'components/DialogError';
import * as React from 'react';
import { WithI18n, withI18n } from 'react-i18next';
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

export default withI18n()(({
  credentials,
  errors,
  onChange,
  onClickResetPassword,
  onClickSignup,
  onSubmit,
  t
}: Props & WithI18n) => (
    <div>
      <TextField
        margin="dense"
        fullWidth={true}
        label={t('signin.login')}
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
        label={t('signin.password')}
        required={true}
        value={credentials.password}
        type="password"
        error={errors.password ? true : false}
        onChange={event => onChange('password', event.target.value)}
        helperText={errors && errors.password}
      />
      {errors.server && <SigninError error={errors.server} />}

      <DialogAltButtons
        heading={t('signin.notRegistered')}
        actionName={t('signin.signupAction')}
        onSubmit={onClickSignup}
      />
      <DialogAltButtons
        actionName={t('signin.forgotPasswordAction')}
        onSubmit={onClickResetPassword}
      />
      <DialogButtons
        onSubmit={onSubmit}
        actionName={t('signin.loginAction')}
      />
    </div>
  ));
