import { SigninErrors, TeacherConfirmData } from '@celluloid/types';
import { TextField } from '@material-ui/core';
import DialogAltButtons from 'components/DialogAltButtons';
import DialogButtons from 'components/DialogButtons';
import SigninError from 'components/DialogError';
import * as React from 'react';
import { WithI18n, withI18n } from 'react-i18next';
import { AnyAction } from 'redux';

interface Props {
  data: TeacherConfirmData;
  errors: SigninErrors;
  onChange(name: string, value: string): void;
  onClickResend(): Promise<AnyAction>;
  onSubmit(): Promise<AnyAction>;
}

export default withI18n()(({
  data,
  errors,
  onChange,
  onClickResend,
  onSubmit,
  t
}: Props & WithI18n) => (
    <div>
      <TextField
        margin="dense"
        fullWidth={true}
        label={t('signin.login')}
        required={true}
        value={data.login}
        error={errors.login ? true : false}
        onChange={event => onChange('signin.login', event.target.value)}
        helperText={errors.login}
      />
      <TextField
        margin="dense"
        fullWidth={true}
        label={t('signin.code')}
        required={true}
        value={data.code}
        error={errors.code ? true : false}
        onChange={event => onChange('code', event.target.value)}
        helperText={
          errors.code ? errors.code : t('signin.codeHelper')
        }
      />
      {errors.server && <SigninError error={errors.server} />}
      <DialogAltButtons
        actionName={t('signin.resendCodeAction')}
        onSubmit={onClickResend}
      />
      <DialogButtons
        onSubmit={onSubmit}
        actionName={t('signin.confirmSignupAction')}
      />
    </div>
  ));
