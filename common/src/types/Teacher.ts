import TagData from './Tag';

export interface SignupValidation {
  success: boolean;
  errors: { email?: string; password?: string; };
}

export interface LoginValidation {
  success: boolean;
  errors: { email?: string; password?: string; };
}

export interface TeacherData {
  email: string;
  firstName?: string;
  lastName?: string;
  subjects?: TagData[];
}

export interface TeacherRecord extends TeacherData {
  id: string;
}

export interface NewTeacherData extends TeacherData {
  password: string;
}

export interface TeacherCredentials {
  email: string;
  password: string;
}
