import { TeacherData, TeacherRecord } from '../../../common/src/types/Teacher';

const randomColor = require('randomcolor');
export interface MaybeWithTeacher {
  teacher?: TeacherRecord;
}

export interface WithTeacher {
  teacher: TeacherRecord;
}

export function getTeacherDisplayName(teacher: TeacherData): string {
  if (!!teacher.firstName && !!teacher.lastName) {
    return `${teacher.firstName} ${teacher.lastName}`;
  } else if (!!teacher.firstName) {
    return teacher.firstName;
  } else if (!!teacher.lastName) {
    return teacher.lastName;
  } else {
    return teacher.email;
  }
}

export function getTeacherInitials(teacher: TeacherData): string {
  return getTeacherDisplayName(teacher)
      .split(' ')
      .map(part => part.substring(0, 1))
      .join();
}

export function getTeacherColor(id: string): string {
  return randomColor({seed: id, luminosity: 'bright'});
}