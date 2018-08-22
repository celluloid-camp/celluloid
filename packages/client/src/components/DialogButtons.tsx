import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { AnyAction } from 'redux';

const styles = ({ spacing }: Theme) =>
  createStyles({
    dialogActionsRoot: {
      marginTop: spacing.unit * 2,
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
      <form
        onSubmit={event => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Button type="submit" variant="contained" color="secondary">
          {actionName}
        </Button>
      </form>
    </DialogActions>
  )
);
