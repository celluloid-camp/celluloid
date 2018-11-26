import { AppState } from 'types/StateTypes';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import * as React from 'react';
import { connect } from 'react-redux';
import { WithI18n, withI18n } from 'react-i18next';

const mapStateToProps = (state: AppState) => ({
  open: state.updated
});

interface Props {
  open: boolean;
}

export default connect(mapStateToProps)(
  withI18n()(({ open, t }: Props & WithI18n) => (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={open}
      message={
        <span>
          {t('update.message')}
        </span>
      }
      action={
        <Button
          color="secondary"
          size="small"
          onClick={() => window.location.reload()}
        >
          {t('update.action')}
        </Button>
      }
    />
  )));