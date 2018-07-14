import * as React from 'react';

import Button from '@material-ui/core/Button';

import { TeacherRecord } from '../../../../common/src/types/Teacher';

interface SigninBarProps {
  user?: TeacherRecord;
  onClickLogin(): void;
  onClickSignup(): void;
  onClickLogout(): void;
}

export default ({ user, onClickLogin, onClickSignup, onClickLogout }: SigninBarProps) =>
  user ? (
    <div>
      <Button
        color="primary"
      >
        {user.username ? user.username : user.email}
      </Button>
      <Button
        onClick={onClickLogout}
        color="primary"
      >
        {`Deconnexion`}
      </Button>
    </div>
  ) : (
      <div>
        <Button
          onClick={onClickSignup}
        >
          {`Inscription`}
        </Button>
        <Button
          onClick={onClickLogin}
          color="primary"
        >
          {`Connexion`}
        </Button>
      </div>
    );