import { SigninErrors, StudentSignupData } from "@celluloid/types";
import { doStudentSignupThunk, openLogin } from "actions/Signin";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { AnyAction, Dispatch } from "redux";
import { Action } from "types/ActionTypes";
import { AppState } from "types/StateTypes";

import StudentSignup from "./StudentSignupComponent";

interface Props {
  errors: SigninErrors;
  onClickLogin(): Action<null>;
  onSubmit(data: StudentSignupData): Promise<AnyAction>;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSubmit: (data: StudentSignupData): Promise<AnyAction> =>
      doStudentSignupThunk(data)(dispatch),
    onClickLogin: () => dispatch(openLogin()),
  };
};

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.signin.errors,
  };
};

const StudentSignupComponent: React.FC<Props> = ({
  errors,
  onClickLogin,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState({
    shareCode: "",
    username: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setState((state) => ({
      ...state,
      [name]: value,
    }));
  };

  return (
    <StudentSignup
      data={state}
      errors={errors}
      onClickLogin={onClickLogin}
      onSubmit={() => onSubmit(state)}
      onChange={handleChange}
    />
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StudentSignupComponent);
