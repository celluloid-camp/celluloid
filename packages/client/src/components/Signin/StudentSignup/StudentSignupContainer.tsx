import { SigninErrors, StudentSignupData } from '@celluloid/types';
import { doStudentSignupThunk, openLogin } from 'actions/Signin';
import * as React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { Action } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';

import StudentSignup from './StudentSignupComponent';

interface Props {
  errors: SigninErrors;
  onClickLogin(): Action<null>;
  onSubmit(data: StudentSignupData): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (data: StudentSignupData): Promise<AnyAction> =>
      doStudentSignupThunk(data)(dispatch),
    onClickLogin: () => dispatch(openLogin())
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.errors
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  class extends React.Component<Props, StudentSignupData> {
    state = {
      shareCode: '',
      username: '',
      password: '',
      passwordHint: 'Quel est le nom de ton livre préféré ?'
    };

    render() {
      const onChange = (name: string, value: string) => {
        this.setState(state => ({
          ...state,
          [name]: value
        }));
      };

      return (
        <StudentSignup
          data={this.state}
          errors={this.props.errors}
          onClickLogin={this.props.onClickLogin}
          onSubmit={() => this.props.onSubmit(this.state)}
          onChange={onChange}
        />
      );
    }
  }
);
