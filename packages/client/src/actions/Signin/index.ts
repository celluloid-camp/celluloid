import { ActionType, createEmptyAction } from "~types/ActionTypes";

export const closeSignin = () => createEmptyAction(ActionType.CLOSE_SIGNIN);

export const triggerSigninLoading = () =>
  createEmptyAction(ActionType.TRIGGER_SIGNIN_LOADING);

export * from "./LoginActions";
export * from "./ResetPasswordActions";
export * from "./SignupActions";
export * from "./StudentSignupActions";
export * from "./UserActions";
