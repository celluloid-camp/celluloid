import { UserRecord } from './UserTypes';

export interface CommentRecord {
  id: string;
  annotationId: string;
  userId: string;
  text: string;
  createdAt: string;
  user: UserRecord;
}