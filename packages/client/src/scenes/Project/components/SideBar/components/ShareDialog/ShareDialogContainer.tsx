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
import WarningIcon from '@material-ui/icons/Warning';
import { cancelShareProject, shareProjectThunk } from 'actions/ProjectActions';
import DialogError from 'components/DialogError';
import DialogHeader from 'components/DialogHeader';
import ShareCredentials from 'components/ShareCredentials';
import * as passwordGenerator from 'password-generator';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AsyncAction, EmptyAction } from 'types/ActionTypes';
import { AppState, SharingStatus } from 'types/StateTypes';

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
  connect(mapStateToProps, mapDispatchToProps)(
    class extends React.Component<Props, ProjectShareData> {
      state = {
        sharePassword: `${pass()}-${pass()}-${pass()}`,
      } as ProjectShareData;

      render() {
        const {
          project,
          onCancel,
          onSubmit,
          status,
          error,
          classes
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
              title="Partager"
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
                  <b>{`Conservez bien ce mot de passe.`}</b>
                  {` L'application ne pourra plus l'afficher une fois`
                    + ` cette fenêtre fermée. En cas de perte, il faudra`
                    + ` en créer un nouveau.`}
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
                  {`Pour ouvrir une fiche pédagogique`
                    + ` imprimable dans une nouvelle fenêtre, `}
                  <a
                    href={`/shares/${project.id}?p=${sharePassword}`}
                    target="_blank"
                  >
                    {`cliquez ici`}
                  </a>.
              </Typography>
              </div>
              {error && <DialogError error={error} />}
            </ DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => onCancel()}
              >
                <CancelIcon fontSize="inherit" style={{ marginRight: 16 }} />
                {`Annuler`}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onSubmit(project.id, this.state)}
              >
                <CancelIcon fontSize="inherit" style={{ marginRight: 16 }} />
                {`Partage`}
              </Button>
            </DialogActions>
          </Dialog >
        );
      }
    }
  ));
