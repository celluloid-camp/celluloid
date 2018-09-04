import {
  AnnotationData,
  AnnotationRecord,
  UserRecord
} from '@celluloid/types';
import { database, getExactlyOne } from 'backends/Database';
import { QueryBuilder } from 'knex';

import * as ProjectStore from './ProjectStore';

export function selectByProject(projectId: string, user?: UserRecord) {
  return database
    .select(
      database.raw('"Annotation".*'),
      database.raw(
        'json_build_object(' +
        `'id', "User"."id",` +
        `'email', "User"."email",` +
        `'username', "User"."username",` +
        `'role', "User"."role"` +
        ') as "user"'))
    .from('Annotation')
    .innerJoin('Project', 'Project.id', 'Annotation.projectId')
    .innerJoin('User', 'User.id', 'Annotation.userId')
    .where('Annotation.projectId', projectId)
    .andWhere((nested: QueryBuilder) => {
      nested.modify(ProjectStore.orIsOwner, user);
      nested.modify(ProjectStore.orIsCollaborativeMember, user);
      return nested;
    })
    .orderBy('Annotation.startTime', 'asc');
}

export function selectOne(annotationId: string, user?: UserRecord) {
  return database
    .select(
      database.raw('"Annotation".*'),
      database.raw(
        'json_build_object(' +
        `'id', "User"."id",` +
        `'email', "User"."email",` +
        `'username', "User"."username",` +
        `'role', "User"."role"` +
        ') as "user"'))
    .from('Annotation')
    .innerJoin('Project', 'Project.id', 'Annotation.projectId')
    .innerJoin('User', 'User.id', 'Annotation.userId')
    .where('Annotation.id', annotationId)
    .andWhere((nested: QueryBuilder) => {
      nested.modify(ProjectStore.orIsOwner, user);
      nested.modify(ProjectStore.orIsCollaborativeMember, user);
      return nested;
    })
    .first()
    .then((row?: AnnotationRecord) => row ? Promise.resolve(row) :
      Promise.reject(new Error('AnnotationNotFound')));
}

export function insert(
  annotation: AnnotationData,
  user: UserRecord,
  projectId: string
) {
  return database('Annotation')
    .insert({
      id: database.raw('uuid_generate_v4()'),
      text: annotation.text,
      startTime: annotation.startTime,
      stopTime: annotation.stopTime,
      pause: annotation.pause,
      userId: user.id,
      projectId: projectId
    })
    .returning('id')
    .then(getExactlyOne)
    .then(id => selectOne(id, user));
}

export function update(id: string, data: AnnotationData, user: UserRecord) {
  return database('Annotation')
    .update({
      text: data.text,
      startTime: data.startTime,
      stopTime: data.stopTime,
      pause: data.pause
    })
    .returning('id')
    .where('id', id)
    .then(getExactlyOne)
    .then(() => selectOne(id, user));
}

export function del(id: string) {
  return database('Annotation')
    .where('id', id)
    .del();
}