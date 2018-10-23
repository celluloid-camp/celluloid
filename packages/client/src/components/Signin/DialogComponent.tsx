import DialogHeader from 'components/DialogHeader';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';

import ConfirmResetPassword from './ConfirmResetPassword';
import ConfirmSignup from './ConfirmSignup';
import Login from './Login';
import ResetPassword from './ResetPassword';
import Signup from './Signup';
import StudentSignup from './StudentSignup';

const styles = ({ spacing }: Theme) =>
  createStyles({
    content: {
      padding: spacing.unit * 2,
      margin: spacing.unit
    }
  });

interface Props extends WithStyles<typeof styles> {
  loading: boolean;
  title: string;
  open: boolean;
  Content?:
  | typeof Login
  | typeof Signup
  | typeof StudentSignup
  | typeof ConfirmSignup
  | typeof ResetPassword
  | typeof ConfirmResetPassword;
  onCancel(): void;
}

export default withStyles(styles)((props: Props) => {
  const { loading, classes, title, open, onCancel, Content } = props;

  return (
    <Dialog
      scroll="body"
      open={open}
      maxWidth="xs"
      fullWidth={true}
      onClose={() => onCancel()}
    >
      <DialogHeader
        title={title}
        loading={loading}
        onClose={onCancel}
      />
      <DialogContent className={classes.content}>
        {Content && <Content />}
      </DialogContent>
    </Dialog>
  );
});
