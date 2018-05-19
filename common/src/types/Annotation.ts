import { TeacherRecord } from "./Teacher";

export interface AnnotationRecord extends AnnotationData {
  id: string;
  teacher: TeacherRecord;
}

export interface AnnotationData {
  text: string;
  startTime: number;
  stopTime: number;
  pause: boolean;
}