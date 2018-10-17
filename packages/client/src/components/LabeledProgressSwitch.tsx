import {
  CircularProgress,
  Collapse,
  createStyles,
  Switch,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import DialogError from 'components/DialogError';
import * as React from 'react';

const styles = ({ spacing }: Theme) => createStyles({
  wrapper: {
    position: 'relative'
  },
  error: {
    position: 'absolute',
    right: 62,
    top: spacing.unit * 3,
  },
  progress: {
    marginRight: spacing.unit * 2
  }
});

interface Props extends WithStyles<typeof styles> {
  label: string;
  checked: boolean;
  loading: boolean;
  onChange: Function;
  error?: string;
}

export default withStyles(styles)(({
  label,
  checked,
  loading,
  error,
  onChange,
  classes
}: Props) => (
    <div className={classes.wrapper}>
      <Typography
        variant="body2"
        align="right"
        gutterBottom={true}
        component="div"
      >
        {loading &&
          <CircularProgress
            color="secondary"
            className={classes.progress}
            size={16}
            variant="indeterminate"
          />
        }
        {label}
        <Switch
          checked={checked}
          onChange={() => onChange()}
        />
      </Typography>
      <div
        className={classes.error}
      >
        <Collapse in={error ? true : false} appear={true}>
          <DialogError small={true} align="right" error={error} />
        </Collapse>
      </div>
    </div>
  ));