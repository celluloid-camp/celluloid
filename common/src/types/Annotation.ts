import { TeacherRecord } from './Teacher';

export interface AnnotationData {
  text: string;
  startTime: number;
  stopTime: number;
  pause: boolean;
}

export interface AnnotationRecord extends AnnotationData {
  projectId: string;
  teacherId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  teacher: TeacherRecord;
}