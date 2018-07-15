import * as React from 'react';
import { AnyAction } from 'redux';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { SigninErrors, TeacherConfirmData } from '../../../../../common/src/types/TeacherTypes';
import SigninAction from '../SigninAction';

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
  onSubmit,
}: Props) => (
    <div>
      <TextField
        label="Email"
        required={true}
        value={data.email}
        error={errors && errors.email ? true : false}
        style={{ display: 'flex', flex: 1 }}
        onChange={event => onChange('email', event.target.value)}
        helperText={errors && errors.email}
      />
      <TextField
        label="Code de confirmation"
        required={true}
        value={data.code}
        error={errors && errors.code ? true : false}
        style={{ display: 'flex', flex: 1 }}
        onChange={event => onChange('confirmationCode', event.target.value)}
        helperText={errors && errors.code ? errors.code : 'Ce code vous a été envoyé par email'}
      />
      <div
        style={{
          justifyContent: 'center',
          display: 'flex',
          paddingTop: 16,
          flexWrap: 'wrap',
        }}
      >
        {errors && errors.server &&
          <Typography
            style={{
              color: 'red',
              fontWeight: 'bold'
            }}
          >
            {errors.server}
          </Typography>
        }
      </div>
      <div
        style={{
          justifyContent: 'center',
          paddingBottom: 16,
          display: 'flex',
          flexWrap: 'wrap'
        }}
      >
        <Button
          onClick={onClickResend}
          color="primary"
        >
          {`Envoyer un nouveau code`}
        </Button>
      </div>
      <SigninAction
        onSubmit={onSubmit}
        actionName="Confirmer l'inscription"
      />
    </div>
  );