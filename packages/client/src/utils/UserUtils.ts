import { UserRecord } from '@celluloid/types';

const randomColor = require('randomcolor');

export function getUserInitials(user: UserRecord): string {
  return user.username
    .split(/\s+/)
    .map(part => part.substring(0, 1))
    .join('')
    .substring(0, 2);
}

export function getUserColor(user: UserRecord): string {
  return randomColor({ seed: user.id, luminosity: 'bright' });
}

export function isTeacher(user?: UserRecord) {
  return user && user.role === 'Teacher';
}

export function isAdmin(user?: UserRecord) {
  return user && user.role === 'Admin';
}
