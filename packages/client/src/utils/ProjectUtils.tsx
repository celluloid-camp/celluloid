import { ProjectGraphRecord, UserRecord } from '@celluloid/types';

export function isOwner(
  project: ProjectGraphRecord,
  user: UserRecord
) {
  return user.id === project.userId;
}

export function isMember(
  project: ProjectGraphRecord,
  user: UserRecord
) {
  return new Set(project.members).has(user);
}

export function canAnnotate(
  project: ProjectGraphRecord,
  user: UserRecord
) {
  return isOwner(project, user)
    || (
      project.collaborative
    );
}
export const canShare = isOwner;
export const canDelete = isOwner;
export const canEdit = isOwner;