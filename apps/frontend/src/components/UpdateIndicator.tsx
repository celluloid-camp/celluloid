import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import * as React from "react";
import { Trans } from "react-i18next";

interface Props {
  open: boolean;
}

export const UpdateIndicator: React.FC<Props> = ({ open }: Props) => (
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
