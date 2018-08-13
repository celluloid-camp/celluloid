import { TeacherData, TeacherRecord } from '@celluloid/commons';

const randomColor = require('randomcolor');

export interface WithLogin {
  teacher?: TeacherRecord;
}

export interface WithTeacher {
  teacher: TeacherRecord;
}

export function getTeacherInitials(teacher: TeacherData): string {
  return teacher.username
    .split(/\s+/)
    .map(part => part.substring(0, 1))
    .join('')
    .substring(0, 2);
}

export function getTeacherColor(id: string): string {
  return randomColor({ seed: id, luminosity: 'bright' });
}