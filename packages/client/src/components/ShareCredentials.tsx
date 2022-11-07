import {
  createStyles,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import React from "react";
import { Trans } from "react-i18next";

const styles = ({ spacing }: Theme) =>
  createStyles({
    shareInfo: {
      marginBottom: spacing.unit * 2,
    },
    password: {
      fontFamily: "monospace",
    },
  });

interface Props extends WithStyles<typeof styles> {
  name: string;
  password: string;
}

export default withStyles(styles)(({ name, password, classes }: Props) => (
  <>
    <div className={classes.shareInfo}>
      <Typography variant="caption" gutterBottom={true}>
        <Trans i18nKey={"signin.projectCode"} />
      </Typography>
      <Typography
        variant="body2"
        gutterBottom={true}
        className={classes.password}
      >
        {`${name}-${password}`}
      </Typography>
    </div>
  </>
));
