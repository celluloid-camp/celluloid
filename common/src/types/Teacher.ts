export interface SignupValidation {
  success: boolean;
  errors : {
    email?: string;
    password?: string;
  }
}

export interface LoginValidation {
  success: boolean;
  errors: {
    email?: string;
    password?: string;
  }
}
