import { createStyles, Theme, Typography, WithStyles, withStyles } from '@material-ui/core';
import classnames from 'classnames';
import * as React from 'react';

const styles = ({ palette, spacing }: Theme) => createStyles({
  center: {
    justifyContent: 'center'
  },
  left: {
    justifyContent: 'flex-start'
  },
  right: {
    justifyContent: 'flex-end'
  },
  root: {
    display: 'flex',
    paddingTop: spacing.unit,
    paddingBottom: spacing.unit,
    flexWrap: 'wrap'
  },
  message: {
    color: palette.error.main,
  }
});

interface Props extends WithStyles<typeof styles> {
  error?: string;
  small?: boolean;
  align?: 'right' | 'center' | 'left';
}

export default withStyles(styles)(({
  align,
  error,
  small,
  classes
}: Props) => {

  const justifyClass = () => {
    switch (align) {
      case 'left':
        return classes.left;
      case 'right':
        return classes.right;
      default:
        return classes.center;
    }
  };

  return (
    <div
      className={classnames([classes.root, justifyClass()])}
    >
      <Typography
        align={align}
        className={classes.message}
        variant={small ? 'caption' : 'body2'}
      >
        {error}
      </Typography>
    </div>
  );
});
