import {
  Button,
  CircularProgress,
  createStyles,
  Theme,
  WithStyles,
  withStyles
} from '@material-ui/core';
import { ButtonClassKey, ButtonProps } from '@material-ui/core/Button';
import classnames from 'classnames';
import * as React from 'react';

const styles = ({ spacing }: Theme) => createStyles({
  wrapper: {
    margin: spacing.unit,
    position: 'relative',
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  sizeSmall: {
    marginTop: -10,
    marginLeft: -10
  },
  sizeDefault: {
    marginTop: -12,
    marginLeft: -12,
  }
});

type WithoutClassKey<T> = {
  [P in keyof T]: T[P] extends ButtonClassKey ? never : T[P]
}[keyof T];

interface Props extends WithStyles<typeof styles>, Pick<ButtonProps, WithoutClassKey<ButtonProps>> {
  loading: boolean;
}
export default withStyles(styles)(({
  loading, classes, disabled, children, size, color, ...otherProps
}: Props) => {

  const {
    size: progressSize,
    sizeClass: progressClassName
  } = (() => {
    switch (size) {
      case 'small':
        return { size: 20, sizeClass: classes.sizeSmall };
      default:
        return { size: 24, sizeClass: classes.sizeDefault };
    }
  })();

  return (
    <div className={classes.wrapper} >
      <Button
        {...otherProps}
        size={size}
        disabled={loading || disabled}
        color={color}
      >
        {children}
      </Button>
      {loading &&
        <CircularProgress
          size={progressSize}
          color={color}
          className={classnames(classes.progress, progressClassName)}
        />
      }
    </div>
  );
});