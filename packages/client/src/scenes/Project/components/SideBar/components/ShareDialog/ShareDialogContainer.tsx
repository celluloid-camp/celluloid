import { ProjectGraphRecord, ProjectShareData } from "@celluloid/types";
import CancelIcon from "@mui/icons-material/Clear";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { cancelShareProject, shareProjectThunk } from "~actions/ProjectActions";
import DialogError from "~components/DialogError";
import DialogHeader from "~components/DialogHeader";
import { ShareCredentials } from "~components/ShareCredentials";
import { AsyncAction, EmptyAction } from "~types/ActionTypes";
import { AppState, SharingStatus } from "~types/StateTypes";

// const styles = ({ spacing }: Theme) =>
//   createStyles({
//     icons: {
//       marginRight: spacing.unit * 2,
//       fontSize: 30,
//     },
//     content: {
//       padding: spacing.unit * 2,
//       margin: spacing.unit,
//     },
//     highlights: {
//       display: "flex",
//       marginTop: spacing.unit,
//       marginBottom: spacing.unit * 2,
//       alignItems: "flex-start",
//     },
//   });

function passwordGenerator(
  length: number,
  allowSymbols: boolean,
  allowedChars: RegExp
): string {
  let result = "";
  let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (allowSymbols) {
    chars += "!@#$%^&*()_+~`|}{[]:;?><,./-=";
  }
  const charArray = [...chars.matchAll(allowedChars)].map((match) => match[0]);
  for (let i = 0; i < length; i++) {
    result += charArray[Math.floor(Math.random() * charArray.length)];
  }
  return result;
}

interface Props {
  project: ProjectGraphRecord;
  error?: string;
  status: SharingStatus;
  onCancel(): EmptyAction;
  onSubmit(
    projectId: string,
    data: ProjectShareData
  ): AsyncAction<ProjectGraphRecord, string>;
}

function pass() {
  return passwordGenerator(6, false, /[\w\d]/g);
}

const mapStateToProps = (state: AppState) => ({
  status: state.sharing.status,
  error: state.sharing.error,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(cancelShareProject()),
  onSubmit: (projectId: string, data: ProjectShareData) =>
    shareProjectThunk(projectId, data)(dispatch),
});

const SharedDialogContainer: React.FC<Props> = ({
  project,
  onCancel,
  onSubmit,
  status,
  error,
}) => {
  const { t } = useTranslation();
  const [sharePassword] = useState(`${pass()}-${pass()}`);

  return (
    <Dialog
      maxWidth="xs"
      open={status !== SharingStatus.CLOSED}
      fullWidth={true}
      onClose={() => onCancel()}
    >
      <DialogHeader
        title={t("shareAction") || ""}
        onClose={() => onCancel()}
        loading={status === SharingStatus.LOADING}
      />
      <DialogContent>
        <ShareCredentials name={project.shareName} password={sharePassword} />
        <div>
          <WarningIcon color="primary" />
          <Typography gutterBottom={true}>
            <b>{t("project.codeWarning.title")}</b>
            {t("project.codeWarning.description")}
          </Typography>
        </div>
        <div>
          <PrintIcon color="primary" />
          <Typography gutterBottom={true}>
            {t("project.share.dialog.description")}
            <a
              href={`/shares/${project.id}?p=${sharePassword}`}
              target="_blank"
              rel="noreferrer"
            >
              {t("project.share.dialog.linkText")}
            </a>
            .
          </Typography>
        </div>
        {error && <DialogError error={error} />}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => onCancel()}
        >
          <CancelIcon fontSize="inherit" style={{ marginRight: 16 }} />
          {t("cancelAction")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSubmit(project.id, { sharePassword })}
        >
          <ShareIcon fontSize="inherit" style={{ marginRight: 16 }} />
          {t("shareAction")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SharedDialogContainer);
