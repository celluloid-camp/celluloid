import { SigninErrors, StudentSignupData } from '@celluloid/types';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import DialogAltButtons from 'components/DialogAltButtons';
import DialogButtons from 'components/DialogButtons';
import DialogError from 'components/DialogError';
import * as React from 'react';
import { WithI18n, withI18n } from 'react-i18next';
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

export default withStyles(styles)(withI18n()(
  ({
    classes,
    data,
    errors,
    onChange,
    onSubmit,
    onClickLogin,
    t
  }: Props & WithI18n) => (
      <>
        <TextField
          margin="dense"
          fullWidth={true}
          error={errors.username ? true : false}
          label={t('signin.projectCode')}
          value={data.shareCode}
          required={true}
          onChange={event => onChange('shareCode', event.target.value)}
          helperText={errors && errors.shareCode}
        />
        <TextField
          margin="dense"
          fullWidth={true}
          error={errors.email ? true : false}
          label={t('signin.username')}
          value={data.username}
          required={true}
          onChange={event => onChange('username', event.target.value)}
          helperText={errors.username}
        />
        {errors.server && <DialogError error={errors.server} />}
        <DialogAltButtons
          heading={t('signin.alreadyRegistered')}
          actionName={t('signin.loginAction')}
          onSubmit={onClickLogin}
        />
        <DialogButtons
          onSubmit={onSubmit}
          actionName={t('signin.joinAction')}
        />
      </>
    )
));
