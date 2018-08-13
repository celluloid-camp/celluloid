import { TeacherData, TeacherRecord } from '@celluloid/commons';

const randomColor = require('randomcolor');

export interface WithUser {
  user?: TeacherRecord;
}

export function getUserInitials(teacher: TeacherData): string {
  return teacher.username
    .split(/\s+/)
    .map(part => part.substring(0, 1))
    .join('')
    .substring(0, 2);
}

export function getUserColor(id: string): string {
  return randomColor({ seed: id, luminosity: 'bright' });
}