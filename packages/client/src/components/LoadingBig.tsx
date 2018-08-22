import { CircularProgress, createStyles, WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';

const styles = createStyles({
  wrapper: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto'
  },
});

export default withStyles(styles)(({ classes }:
  WithStyles<typeof styles>) => (
    <div className={classes.wrapper}>
      <CircularProgress size={100} />
    </div>
  ));