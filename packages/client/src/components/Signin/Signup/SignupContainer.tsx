import { SigninErrors, TeacherSignupData, UserRecord  } from '@celluloid/types';
import { doSignupThunk, openLogin } from 'actions/Signin';
import * as React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { Action } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';
import { PeertubeVideoInfo } from 'types/YoutubeTypes';


import Signup from './SignupComponent';

interface Props {
  user?: UserRecord;
  video?: PeertubeVideoInfo;
  errors: SigninErrors;
  onClickLogin(): Action<null>;
  onSubmit(data: TeacherSignupData): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (data: TeacherSignupData): Promise<AnyAction> =>
      doSignupThunk(data)(dispatch),
    onClickLogin: () => dispatch(openLogin())
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    user: state.user,
    video: state.home.video,
    errors: state.signin.errors
  };
};

interface State extends TeacherSignupData {
  confirmPassword: string;
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(class extends React.Component<Props, State> {
  state = {
    username: this.props.user ? this.props.user.username : '',
    email: '',
    password: '',
    confirmPassword: ''
  } as State;

  render() {
    const onChange = (name: string, value: string) => {
      this.setState(state => ({
        ...state,
        [name]: value
      }));
    };

    const confirmPasswordError =
      this.state.confirmPassword === this.state.password
        ? false
        : true;

    return (
      <Signup
        user={this.props.user}
        video={this.props.video}
        data={this.state}
        errors={this.props.errors}
        confirmPasswordError={confirmPasswordError}
        onClickLogin={this.props.onClickLogin}
        onSubmit={() => this.props.onSubmit(this.state)}
        onChange={onChange}
      />
    );
  }
});
