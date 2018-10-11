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

const styles = ({ spacing }: Theme) => createStyles({
  paper: {
    margin: spacing.unit * 4,
  },
  body: {
    padding: spacing.unit * 4
  },
  buttonWrapper: {
    padding: spacing.unit * 2
  }
});

export default withStyles(styles)(
  ({ classes }: WithStyles<typeof styles>) => (
    <Paper className={classes.paper}>
      <div className={classes.body}>
        <Typography variant="h4" gutterBottom={true}>
          {`Page introuvable :(`}
        </Typography>
        <Typography>
          {`La page que vous cherchez est peut-être privée, à peut-être été supprimée`
            + ` ou n'est pas accessible sans vous connecter `}
        </Typography>
      </div>
      <div className={classes.buttonWrapper}>
        <Button component={getButtonLink('.')}>
          {`RETOUR À L'ACCUEIL`}
        </Button>
      </div>
    </Paper >
  ));