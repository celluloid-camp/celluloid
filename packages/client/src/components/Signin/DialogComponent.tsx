import * as React from 'react';

import {
  Theme,
  createStyles,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import ConfirmResetPassword from './ConfirmResetPassword';
import ResetPassword from './ResetPassword';
import ConfirmSignup from './ConfirmSignup';
import Signup from './Signup';
import Login from './Login';
import StudentSignup from './StudentSignup';

const styles = ({ spacing }: Theme) =>
  createStyles({
    closeIcon: {
      position: 'absolute',
      right: 16,
      top: 8
    },
    progress: {
      flexGrow: 1
    },
    title: {
      textTransform: 'uppercase',
      textAlign: 'center'
    },
    content: {
      padding: spacing.unit * 2,
      margin: spacing.unit
    }
  });

interface Props extends WithStyles<typeof styles> {
  loading: boolean;
  title: string;
  open: boolean;
  onCancel: Function;
  Content?:
    | typeof Login
    | typeof Signup
    | typeof StudentSignup
    | typeof ConfirmSignup
    | typeof ResetPassword
    | typeof ConfirmResetPassword;
}

export default withStyles(styles)((props: Props) => {
  const { loading, classes, title, open, onCancel, Content } = props;

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth={true}
      onClose={() => onCancel()}
    >
      <DialogTitle className={classes.title}>
        <span className={classes.closeIcon}>
          <IconButton onClick={() => onCancel()}>
            <CloseIcon />
          </IconButton>
        </span>
        {title}
      </DialogTitle>
      <div className={classes.progress}>
        {loading ? (
          <LinearProgress variant="query" />
        ) : (
          <LinearProgress variant="determinate" value={0} />
        )}
      </div>
      <DialogContent className={classes.content}>
        {Content && <Content />}
      </DialogContent>
    </Dialog>
  );
});
