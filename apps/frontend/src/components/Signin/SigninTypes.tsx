import { t } from 'i18next';

interface SigninStateInterface {
  readonly kind: string;
  readonly name: string;
}

export class SignupOpen implements SigninStateInterface {
  readonly kind = 'Signup';
  readonly name = t('signin.signupTitle');
}

export class ConfirmSignupOpen implements SigninStateInterface {
  readonly kind = 'ConfirmSignup';
  readonly name = t('signin.confirmSignupTitle');
}

export class LoginOpen implements SigninStateInterface {
  readonly kind = 'Login';
  readonly name = t('signin.loginTitle');
}

export class ResetPasswordOpen implements SigninStateInterface {
  readonly kind = 'ResetPassword';
  readonly name = t('signin.forgotPasswordTitle');
}

export class ConfirmResetPasswordOpen implements SigninStateInterface {
  readonly kind = 'ConfirmResetPassword';
  readonly name = t('signin.forgotPasswordTitle');
}

export class StudentSignupOpen implements SigninStateInterface {
  readonly kind = 'StudentSignup';
  readonly name = t('signin.joinProjectTitle');
}

export class Closed implements SigninStateInterface {
  readonly kind = 'None';
  readonly name = '';
}

export type SigninState
  = SignupOpen
  | ConfirmSignupOpen
  | LoginOpen
  | ResetPasswordOpen
  | ConfirmResetPasswordOpen
  | StudentSignupOpen
  | Closed;

export type SigninComponent
  = SignupOpen
  | ConfirmSignupOpen
  | LoginOpen
  | ResetPasswordOpen
  | StudentSignupOpen
  | ConfirmResetPasswordOpen;