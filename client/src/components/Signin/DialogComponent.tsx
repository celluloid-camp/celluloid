import * as React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import LinearProgress from '@material-ui/core/LinearProgress';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Signup from './Signup';
import Login from './Login';
import ConfirmSignup from './ConfirmSignup';

const styles = createStyles({
  closeIcon: {
    position: 'absolute', right: 16, top: 8
  },
  progress: {
    flexGrow: 1
  }
});

interface Props extends WithStyles<typeof styles> {
  loading: boolean;
  title: string;
  open: boolean;
  onCancel: Function;
  Content?: typeof Login | typeof Signup | typeof ConfirmSignup | undefined;
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
      <DialogTitle style={{ textAlign: 'center' }}>
        <span className={classes.closeIcon}>
          <IconButton onClick={() => onCancel()}>
            <CloseIcon />
          </IconButton>
        </span>
        {title}
      </DialogTitle>
      <div className={classes.progress}>
        {loading ?
          <LinearProgress variant="query" />
          :
          <LinearProgress variant="determinate" value={0} />
        }
      </div>
      <DialogContent style={{ padding: 16 }}>
        {Content &&
          <Content />
        }
      </DialogContent>
    </Dialog>
  );
});