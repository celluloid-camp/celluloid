import TagData from './TagTypes';

export interface SigninErrors {
  email?: string;
  password?: string;
  username?: string;
  confirmPassword?: string;
  code?: string;
  server?: string;
}

export interface SigninValidation {
  success: boolean;
  errors: SigninErrors;
}

export interface TeacherData {
  email: string;
  username: string;
  subjects?: TagData[];
}

export interface TeacherRecord extends TeacherData {
  id: string;
}

export interface TeacherSignupData extends TeacherData {
  password: string;
}

export interface TeacherConfirmData {
  email: string;
  code: string;
}

export interface ConfirmSignupErrors {
  email: string;
  code: string;
}

export interface ConfirmSignupValidation {
  success: boolean;
  errors?: ConfirmSignupErrors;
}

export interface TeacherCredentials {
  email: string;
  password: string;
}