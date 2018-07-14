import * as React from 'react';
import { AnyAction } from 'redux';

import { Action } from 'types/Action';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { LoginErrors } from '../../../../../common/src/types/Teacher';
import SigninAction from '../SigninAction';

interface Props {
  errors?: LoginErrors;
  onChange(name: string, value: string): void;
  onClickSignup(): Action<null>;
  onSubmit(): Promise<AnyAction>;
}

export default ({
  errors,
  onChange,
  onSubmit,
  onClickSignup
}: Props) => (
    <div>
      <TextField
        label="Email"
        required={true}
        error={errors && errors.email ? true : false}
        style={{ display: 'flex', flex: 1 }}
        onChange={event => onChange('email', event.target.value)}
        helperText={errors && errors.email}
      />
      <TextField
        label="Mot de passe"
        required={true}
        type="password"
        error={errors && errors.password ? true : false}
        style={{ display: 'flex', flex: 1 }}
        onChange={event => onChange('password', event.target.value)}
        helperText={errors && errors.password}
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
          color="primary"
        >
          {`Mot de passe oublié`}
        </Button>
        <Button
          onClick={onClickSignup}
          color="primary"
        >
          {`Inscription`}
        </Button>
      </div>
      <SigninAction
        onSubmit={onSubmit}
        actionName="Se connecter"
      />
    </div>
  );