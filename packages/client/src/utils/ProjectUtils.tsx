import { ProjectGraphRecord, UserRecord } from '@celluloid/types';

export function isOwner(
  project: ProjectGraphRecord,
  user: UserRecord
) {
  return user.id === project.userId;
}

export function isMember(
  members: Set<UserRecord>,
  user: UserRecord
) {
  return members.has(user);
}

export function isOwnerOrMember(
  project: ProjectGraphRecord,
  members: Set<UserRecord>,
  user: UserRecord
) {
  return isOwner(project, user)
    || isMember(members, user);
}

export const canComment = isOwnerOrMember;
export const canShare = isOwner;
export const canDelete = isOwner;
export const canEdit = isOwner;