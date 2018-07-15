import * as React from 'react';
import { AnyAction, Dispatch } from 'redux';
import { connect } from 'react-redux';

import ConfirmSignup from './ConfirmComponent';
import { doConfirmSignupThunk, doResendCodeThunk } from 'actions/Signin';
import { AppState } from 'types/AppState';

import { SigninErrors, TeacherConfirmData } from '../../../../../common/src/types/TeacherTypes';

interface Props {
  email?: string;
  errors: SigninErrors;
  onClickResend(email: string): Promise<AnyAction>;
  onSubmit(data: TeacherConfirmData): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (data: TeacherConfirmData) =>
      doConfirmSignupThunk(data)(dispatch),
    onClickResend: (email: string) =>
      doResendCodeThunk(email)(dispatch)
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.errors,
    email: state.signin.email
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  class extends React.Component<Props, TeacherConfirmData> {
    state = {
      email: this.props.email ? this.props.email : '',
      code: '',
    } as TeacherConfirmData;

    render() {

      // tslint:disable-next-line:no-console
      console.log(this.props);
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
          onSubmit={() => this.props.onSubmit(this.state)}
          onChange={onChange}
        />
      );
    }
  });