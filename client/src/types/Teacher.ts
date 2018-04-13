import TagData from './Tag';

export interface TeacherData {
  email: string;
  firstName?: string;
  lastName?: string;
  subjects?: TagData[];
}

export interface NewTeacherData extends TeacherData {
  password: string;
}

export interface TeacherCredentials {
  email: string;
  password: string;
}