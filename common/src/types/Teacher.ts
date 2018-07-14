import TagData from './Tag';

export interface SignupErrors {
  email?: string;
  password?: string;
  username?: string;
  confirmPassword?: string;
  server?: string;
}

export interface SignupValidation {
  success: boolean;
  errors?: SignupErrors;
}

export interface LoginErrors {
  email?: string;
  password?: string;
  server?: string;
}

export interface LoginValidation {
  success: boolean;
  errors?: LoginErrors;
}

export interface TeacherData {
  email: string;
  username: string;
  subjects?: TagData[];
}

export interface TeacherRecord extends TeacherData {
  id: string;
}

export interface NewTeacherData extends TeacherData {
  password: string;
}

export interface ConfirmTeacherData {
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