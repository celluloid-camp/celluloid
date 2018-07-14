import * as React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Signup from './Signup';
import Login from './Login';

const styles = createStyles({
  closeIcon: {
    position: 'absolute', right: 16, top: 8
  },
});

interface Props extends WithStyles<typeof styles> {
  title: string;
  open: boolean;
  onCancel: Function;
  Content?: typeof Login | typeof Signup | undefined;
}

export default withStyles(styles)((props: Props) => {
  const { classes, title, open, onCancel, Content } = props;

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
      <DialogContent style={{ padding: 16 }}>
        {Content &&
          <Content />
        }
      </DialogContent>
    </Dialog>
  );
});