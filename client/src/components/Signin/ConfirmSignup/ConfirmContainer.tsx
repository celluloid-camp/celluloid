import * as React from 'react';
import { AnyAction, Dispatch } from 'redux';
import { connect } from 'react-redux';

import ConfirmSignup from './ConfirmComponent';
import { doConfirmSignupThunk, doResendCodeThunk } from 'actions/Signin';
import { AppState } from 'types/AppState';

import {
  SigninErrors,
  TeacherConfirmData,
  TeacherCredentials
} from '../../../../../common/src/types/TeacherTypes';

interface Props {
  credentials?: TeacherCredentials;
  errors: SigninErrors;
  onClickResend(email: string): Promise<AnyAction>;
  onSubmit(
    data: TeacherConfirmData,
    credentials?: TeacherCredentials
  ): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (data: TeacherConfirmData, credentials?: TeacherCredentials) =>
      doConfirmSignupThunk(data, credentials)(dispatch),
    onClickResend: (email: string) => doResendCodeThunk(email)(dispatch)
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.errors,
    credentials: state.signin.credentials
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  class extends React.Component<Props, TeacherConfirmData> {
    state = {
      email: this.props.credentials ? this.props.credentials.email : '',
      code: ''
    } as TeacherConfirmData;

    render() {
      // tslint:disable-next-line:no-console
      console.log(this.props.credentials);
      const onChange = (name: string, value: string) => {
        this.setState(state => ({
          ...state,
          [name]: value
        }));
      };

      return (
        <ConfirmSignup
          data={this.state}
          errors={this.props.errors}
          onClickResend={() => this.props.onClickResend(this.state.email)}
          onSubmit={() =>
            this.props.onSubmit(this.state, this.props.credentials)
          }
          onChange={onChange}
        />
      );
    }
  }
);
