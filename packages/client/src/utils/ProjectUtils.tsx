import { ProjectGraphRecord, UserRecord } from '@celluloid/types';
import * as R from 'ramda';

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
  return !!R.find((elem: UserRecord) =>
    elem.id === user.id
  )(project.members);
}

export function canAnnotate(
  project: ProjectGraphRecord,
  user: UserRecord
) {
  return isOwner(project, user) || isMember(project, user) && project.collaborative;
}

export const canShare = isOwner;
export const canDelete = isOwner;
export const canEdit = isOwner;