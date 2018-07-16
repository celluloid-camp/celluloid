import { TeacherRecord } from '../../../common/src/types/TeacherTypes';

export interface TeacherServerRecord extends TeacherRecord {
  code: string;
  codeExpiresAt: Date;
  confirmed: true;
  password: string;
}