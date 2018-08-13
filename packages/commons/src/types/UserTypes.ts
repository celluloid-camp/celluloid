import { TagData } from './TagTypes';

export interface SigninErrors {
  email?: string;
  password?: string;
  username?: string;
  confirmPassword?: string;
  code?: string;
  server?: string;
  projectShareName?: string;
  projectSharePassword?: string;
  passwordHint?: string;
}

export interface SigninResult {
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

export interface TeacherCredentials {
  email: string;
  password: string;
}

export interface StudentData {
  username: string;
}

export interface StudentRecord extends StudentData {
  id: string;
}

export interface StudentCredentials extends StudentData {
  password: string;
}

export interface StudentSignupData extends StudentCredentials {
  passwordHint: string;
  projectShareName: string;
  projectSharePassword: string;
}

export interface TeacherConfirmResetPasswordData extends TeacherConfirmData,
                                                         TeacherCredentials {}

export interface ConfirmSignupErrors {
  email: string;
  code: string;
}

export interface ConfirmSignupValidation {
  success: boolean;
  errors?: ConfirmSignupErrors;
}

type UserRole
  = 'Admin'
  | 'Teacher'
  | 'Student'
  ;

export interface UserRecord {
  id: string;
  username: string;
  role: UserRole;
}