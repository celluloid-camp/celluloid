import { AppState } from '@celluloid/client/src/types/StateTypes';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import * as React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = (state: AppState) => ({
  open: state.updated
});

interface Props {
  open: boolean;
}

export default connect(mapStateToProps)(({ open }: Props) => (
  <Snackbar
    anchorOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    open={open}
    message={
      <span>
        {`L'application a été mise à jour. Veuillez rafraîchir la page.`}
      </span>
    }
    action={
      <Button
        color="secondary"
        size="small"
        onClick={() => window.location.reload()}
      >
        {`Rafraîchir`}
      </Button>
    }
  />
));