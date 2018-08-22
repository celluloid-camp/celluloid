import {
  UserRecord,
} from '@celluloid/types';

export interface UserServerRecord extends UserRecord {
  confirmed: boolean;
  password: string;
}

export interface TeacherServerRecord extends UserServerRecord {
  code?: string;
  codeExpiresAt?: Date;
  email: string;
}