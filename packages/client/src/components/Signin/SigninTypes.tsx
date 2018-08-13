interface SigninStateInterface {
  readonly kind: string;
  readonly name: string;
}

export class SignupOpen implements SigninStateInterface {
  readonly kind = 'Signup';
  readonly name = 'Inscription';
}

export class ConfirmSignupOpen implements SigninStateInterface {
  readonly kind = 'ConfirmSignup';
  readonly name = 'Confirmation';
}

export class LoginOpen implements SigninStateInterface {
  readonly kind = 'Login';
  readonly name = 'Connexion';
}

export class ResetPasswordOpen implements SigninStateInterface {
  readonly kind = 'ResetPassword';
  readonly name = 'Mot de passe perdu';
}

export class ConfirmResetPasswordOpen implements SigninStateInterface {
  readonly kind = 'ConfirmResetPassword';
  readonly name = 'Mot de passe perdu';
}

export class StudentSignupOpen implements SigninStateInterface {
  readonly kind = 'StudentSignup';
  readonly name = 'Rejoindre un projet';
}

export class StudentLoginOpen implements SigninStateInterface {
  readonly kind = 'StudentLogin';
  readonly name = 'Connexion';
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
  | StudentLoginOpen
  | Closed;

export type SigninComponent
  = SignupOpen
  | ConfirmSignupOpen
  | LoginOpen
  | ResetPasswordOpen
  | StudentSignupOpen
  | StudentLoginOpen
  | ConfirmResetPasswordOpen;