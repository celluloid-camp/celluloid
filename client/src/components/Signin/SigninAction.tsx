import * as React from 'react';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { AnyAction } from 'redux';

const styles = createStyles({

  dialogActionsRoot: {
    justifyContent: 'space-around'
  }
});

interface Props extends WithStyles<typeof styles> {
  actionName: string;
  onSubmit(): Promise<AnyAction>;
}

export default withStyles(styles)(
  ({ actionName, onSubmit, classes }: Props) => (
    <DialogActions
      classes={{
        root: classes.dialogActionsRoot
      }}
    >
      <Button
        onClick={onSubmit}
        color="secondary"
        variant="raised"
      >
        {actionName}
      </Button>
    </DialogActions>
  ));