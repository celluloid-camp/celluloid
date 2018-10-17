import {
  createStyles,
  DialogTitle,
  IconButton,
  LinearProgress,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import * as React from 'react';

const styles = ({ palette, spacing }: Theme) => createStyles({
  closeIcon: {
    position: 'absolute',
    right: spacing.unit,
    top: spacing.unit,
  },
  progress: {
    flexGrow: 1
  },
  title: {
    backgroundColor: palette.primary.main,
    textAlign: 'center',
  },
  titleTypo: {
    color: palette.primary.contrastText
  }
});

interface Props extends WithStyles<typeof styles> {
  title: string;
  loading: boolean;
  children?: React.ReactNode;
  onClose(): void;
}

export default withStyles(styles)(({
  onClose, title, loading, classes, children
}: Props) => (
    <>
      <DialogTitle className={classes.title}>
        <span className={classes.closeIcon}>
          <IconButton onClick={() => onClose()}>
            <CloseIcon nativeColor="white" />
          </IconButton>
        </span>
        <span className={classes.titleTypo}>{title}</span>
      </DialogTitle>
      {children}
      <div className={classes.progress}>
        {loading ? (
          <LinearProgress variant="query" />
        ) : (
            <LinearProgress variant="determinate" value={0} />
          )}
      </div>
    </>
  ));