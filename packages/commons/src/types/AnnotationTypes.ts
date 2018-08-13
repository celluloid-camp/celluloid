import { TeacherRecord } from './UserTypes';

export interface AnnotationData {
  text: string;
  startTime: number;
  stopTime: number;
  pause: boolean;
}

export interface AnnotationRecord extends AnnotationData {
  projectId: string;
  userId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  teacher: TeacherRecord;
}