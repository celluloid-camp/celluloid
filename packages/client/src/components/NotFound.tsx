import {
  Button,
  createStyles,
  Paper,
  Theme,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core';
import { getButtonLink } from 'components/ButtonLink';
import * as React from 'react';
import { withI18n, WithI18n } from 'react-i18next';

const styles = ({ spacing }: Theme) => createStyles({
  body: {
    padding: spacing.unit * 4
  },
  buttonWrapper: {
    padding: spacing.unit * 2
  }
});

export default withStyles(styles)(
  withI18n()(
    ({ classes, t }: WithStyles<typeof styles> & WithI18n) => (
      <Paper>
        <div className={classes.body}>
          <Typography variant="h4" gutterBottom={true}>
            {t('notFound.title')}
          </Typography>
          <Typography>
            {t('notFount.description')}
          </Typography>
        </div>
        <div className={classes.buttonWrapper}>
          <Button component={getButtonLink('.')}>
            {t('notFound.action')}
          </Button>
        </div>
      </Paper >
    )));