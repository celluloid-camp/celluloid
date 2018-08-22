import { Chip, createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';

const styles = ({ palette, spacing }: Theme) => createStyles({
  visibilityChip: {
    backgroundColor: palette.secondary.dark,
    color: 'white',
    margin: spacing.unit / 2
  }
});

interface Props extends WithStyles<typeof styles> {
  label: string;
  show: boolean;
}

export default withStyles(styles)(({
  label,
  show,
  classes
}: Props) => (
    show
      ? (
        <Chip
          className={classes.visibilityChip}
          label={label}
        />
      ) : (
        <></>
      )
  ));