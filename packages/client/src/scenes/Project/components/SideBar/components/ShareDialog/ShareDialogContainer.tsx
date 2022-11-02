import { ProjectGraphRecord, ProjectShareData } from '@celluloid/types';
import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Clear';
import PrintIcon from '@material-ui/icons/Print';
import ShareIcon from '@material-ui/icons/Share';
import WarningIcon from '@material-ui/icons/Warning';
import { cancelShareProject, shareProjectThunk } from 'actions/ProjectActions';
import DialogError from 'components/DialogError';
import DialogHeader from 'components/DialogHeader';
import ShareCredentials from 'components/ShareCredentials';
import passwordGenerator from 'password-generator';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AsyncAction, EmptyAction } from 'types/ActionTypes';
import { AppState, SharingStatus } from 'types/StateTypes';
import { withI18n, WithI18n } from 'react-i18next';

const styles = ({ spacing }: Theme) => createStyles({
  icons: {
    marginRight: spacing.unit * 2,
    fontSize: 30
  },
  content: {
    padding: spacing.unit * 2,
    margin: spacing.unit
  },
  highlights: {
    display: 'flex',
    marginTop: spacing.unit,
    marginBottom: spacing.unit * 2,
    alignItems: 'flex-start',
  },
});

interface Props extends WithStyles<typeof styles> {
  project: ProjectGraphRecord;
  error?: string;
  status: SharingStatus;
  onCancel(): EmptyAction;
  onSubmit(projectId: string, data: ProjectShareData):
    AsyncAction<ProjectGraphRecord, string>;
}

function pass() {
  return passwordGenerator(6, false, /[\w\d]/);
}

const mapStateToProps = (state: AppState) => ({
  status: state.sharing.status,
  error: state.sharing.error
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(cancelShareProject()),
  onSubmit: (projectId: string, data: ProjectShareData) =>
    shareProjectThunk(projectId, data)(dispatch)
});

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(withI18n()(
    class extends React.Component<Props & WithI18n, ProjectShareData> {
      state = {
        sharePassword: `${pass()}-${pass()}`,
      } as ProjectShareData;

      render() {
        const {
          project,
          onCancel,
          onSubmit,
          status,
          error,
          classes,
          t
        } = this.props;

        const { sharePassword } = this.state;

        return (
          <Dialog
            maxWidth="xs"
            open={status !== SharingStatus.CLOSED}
            fullWidth={true}
            onClose={() => onCancel()}
          >
            <DialogHeader
              title={t('shareAction')}
              onClose={() => onCancel()}
              loading={status === SharingStatus.LOADING}
            />
            <DialogContent
              className={classes.content}
            >
              <ShareCredentials
                name={project.shareName}
                password={sharePassword}
              />
              <div
                className={classes.highlights}
              >
                <WarningIcon
                  color="primary"
                  className={classes.icons}
                />
                <Typography gutterBottom={true}>
                  <b>{t('project.codeWarning.title')}</b>
                  {t('project.codeWarning.description')}
                </Typography>
              </div>
              <div
                className={classes.highlights}
              >
                <PrintIcon
                  color="primary"
                  className={classes.icons}
                />
                <Typography gutterBottom={true}>
                  {t('project.share.dialog.description')}
                  <a
                    href={`/shares/${project.id}?p=${sharePassword}`}
                    target="_blank" rel="noreferrer"
                  >
                    {t('project.share.dialog.linkText')}
                  </a>.
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
                {t('cancelAction')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onSubmit(project.id, this.state)}
              >
                <ShareIcon fontSize="inherit" style={{ marginRight: 16 }} />
                {t('shareAction')}
              </Button>
            </DialogActions>
          </Dialog >
        );
      }
    }
  ))
);
