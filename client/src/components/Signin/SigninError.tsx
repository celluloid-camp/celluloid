import * as React from 'react';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Palette from 'utils/PaletteUtils';

const styles = createStyles({
  root: {
    justifyContent: 'center',
    display: 'flex',
    paddingTop: 8,
    paddingBottom: 8,
    flexWrap: 'wrap'
  },
  message: {
    color: Palette.error,
    fontWeight: 'bold'
  }
});

interface Props extends WithStyles<typeof styles> {
  error: string;
}

export default withStyles(styles)(({ error, classes }: Props) => (
  <div className={classes.root}>
    <Typography className={classes.message}>{error}</Typography>
  </div>
));
