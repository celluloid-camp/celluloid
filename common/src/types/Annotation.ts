import { TeacherRecord } from './Teacher';

export interface AnnotationData {
  text: string;
  startTime: number;
  stopTime: number;
  pause: boolean;
}

export interface AnnotationRecord extends AnnotationData {
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  teacherId: string;
  id: string;
  teacher: TeacherRecord;
}