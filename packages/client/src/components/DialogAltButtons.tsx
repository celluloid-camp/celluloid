import * as React from 'react';
import Button from '@material-ui/core/Button';
import { createStyles, withStyles, WithStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { AnyAction } from 'redux';

const styles = createStyles({
  root: {
    justifyContent: 'center',
    display: 'flex',
    paddingTop: 8,
    flexDirection: 'column',
    flexWrap: 'wrap'
  }
});

interface Props extends WithStyles<typeof styles> {
  heading?: string;
  actionName: string;
  onSubmit(): Promise<AnyAction> | AnyAction;
}

export default withStyles(styles)(
  ({ classes, actionName, onSubmit, heading }: Props) => (
    <div className={classes.root}>
      {heading && (
        <Typography variant="caption" style={{ textAlign: 'center' }}>
          {heading}
        </Typography>
      )}
      <Button size="small" onClick={onSubmit} color="primary">
        {actionName}
      </Button>
    </div>
  )
);
