import { UserRecord } from '@celluloid/types';
import {
  Avatar,
  createStyles,
  Theme,
  WithStyles,
  withStyles
} from '@material-ui/core';
import * as React from 'react';
import { getUserColor, getUserInitials } from 'utils/UserUtils';

const styles = ({ spacing }: Theme) => createStyles({
  small: {
    height: spacing.unit * 4,
    width: spacing.unit * 4,
    fontSize: '13px'
  }
});

interface Props extends WithStyles<typeof styles> {
  user: UserRecord;
  noMargin?: boolean;
  small?: boolean;
}

export default withStyles(styles)(({ user, noMargin, small, classes }: Props) => (
  <Avatar
    className={small ? classes.small : undefined}
    style={{
      margin: noMargin ? 0 : small ? 4 : 10,
      backgroundColor: getUserColor(user)
    }}
  >
    {getUserInitials(user)}
  </Avatar>
));