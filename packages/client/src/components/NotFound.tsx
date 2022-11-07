import {
  Button,
  createStyles,
  Paper,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import { getButtonLink } from "components/ButtonLink";
import React from "react";
import { Trans } from "react-i18next";
import { SharedLayout } from "scenes/Menu";

const styles = ({ spacing }: Theme) =>
  createStyles({
    body: {
      padding: spacing.unit * 4,
    },
    buttonWrapper: {
      padding: spacing.unit * 2,
    },
  });

export default withStyles(styles)(({ classes }: WithStyles<typeof styles>) => (
  <SharedLayout>
    <Paper>
      <div className={classes.body}>
        <Typography variant="h4" gutterBottom={true}>
          <Trans i18nKey={"notFound.title"} />
        </Typography>
        <Typography>
          <Trans i18nKey={"notFound.description"} />
        </Typography>
      </div>
      <div className={classes.buttonWrapper}>
        <Button component={getButtonLink(".")}>
          <Trans i18nKey={"notFound.action"} />
        </Button>
      </div>
    </Paper>
  </SharedLayout>
));
