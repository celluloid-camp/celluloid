import { AppState } from "types/StateTypes";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import * as React from "react";
import { connect } from "react-redux";
import { Trans } from "react-i18next";

const mapStateToProps = (state: AppState) => ({
  open: state.updated,
});

interface Props {
  open: boolean;
}

const UpdateIndicator: React.FC<Props> = ({ open }: Props) => (
  <Snackbar
    anchorOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    open={open}
    message={
      <span>
        <Trans i18nKey={"update.message"}></Trans>
      </span>
    }
    action={
      <Button
        color="secondary"
        size="small"
        onClick={() => window.location.reload()}
      >
        <Trans i18nKey={"update.action"}></Trans>
      </Button>
    }
  />
);

export default connect(mapStateToProps)(UpdateIndicator);
