import { createStyles, Theme, Typography, WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import { withI18n, WithI18n } from 'react-i18next';

const styles = ({ spacing }: Theme) => createStyles({
  shareInfo: {
    marginBottom: spacing.unit * 2
  },
  password: {
    fontFamily: 'monospace'
  }
});

interface Props extends WithStyles<typeof styles> {
  name: string;
  password: string;
}

export default withStyles(styles)(
  withI18n()(
    ({ name, password, classes, t }: Props & WithI18n) => (
      <>
        <div className={classes.shareInfo}>
          <Typography variant="caption" gutterBottom={true}>
            {t('signin.projectCode')}
          </Typography>
          <Typography variant="body2" gutterBottom={true} className={classes.password}>
            {`${name}-${password}`}
          </Typography>
        </div>
      </>
    )));