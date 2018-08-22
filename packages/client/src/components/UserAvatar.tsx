import { getUserColor, getUserInitials } from 'utils/UserUtils';
import { UserRecord } from '@celluloid/types';
import { Avatar } from '@material-ui/core';
import * as React from 'react';

interface Props {
  user: UserRecord;
  noMargin?: boolean;
}

export default ({ user, noMargin }: Props) => (
  <Avatar
    style={{
      margin: noMargin ? 0 : 10,
      backgroundColor: getUserColor(user)
    }}
  >
    {getUserInitials(user)}
  </Avatar>
);