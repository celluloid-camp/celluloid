interface DialogStateInterface {
  readonly kind: string;
  readonly title: string;
}

export class SignupOpen implements DialogStateInterface {
  readonly kind = 'Signup';
  readonly title = 'Inscription';
}

export class ConfirmSignupOpen implements DialogStateInterface {
  readonly kind = 'ConfirmSignup';
  readonly title = 'Confirmation';
}

export class LoginOpen implements DialogStateInterface {
  readonly kind = 'Login';
  readonly title = 'Connexion';
}

export class ResetPasswordOpen implements DialogStateInterface {
  readonly kind = 'ResetPassword';
  readonly title = 'Mot de passe perdu';
}

export class ConfirmResetPasswordOpen implements DialogStateInterface {
  readonly kind = 'ConfirmResetPassword';
  readonly title = 'Mot de passe perdu';
}

export class Closed implements DialogStateInterface {
  readonly kind = 'None';
  readonly title = '';
}

export type DialogState
  = SignupOpen
  | ConfirmSignupOpen
  | LoginOpen
  | ResetPasswordOpen
  | ConfirmResetPasswordOpen
  | Closed;

export type SigninComponent
  = SignupOpen
  | ConfirmSignupOpen
  | LoginOpen
  | ResetPasswordOpen
  | ConfirmResetPasswordOpen;