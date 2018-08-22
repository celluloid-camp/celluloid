import { database, getExactlyOne } from 'backends/Database';
import * as ProjectStore from './ProjectStore';
import { UserRecord } from '@celluloid/types';
import { AnnotationRecord, AnnotationData } from '@celluloid/types';

import { QueryBuilder } from 'knex';

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
      nested.where('Project.public', true);
      nested.modify(ProjectStore.orIsOwner, user);
      nested.modify(ProjectStore.orIsMember, user);
      return nested;
    })
    .orderBy('Annotation.startTime', 'asc');
}

export function selectOne(annotationId: string, user?: UserRecord) {
  return database.first()
    .from('Annotation')
    .innerJoin('Project', 'Project.id', 'Annotation.projectId')
    .where('Annotation.id', annotationId)
    .andWhere((nested: QueryBuilder) => {
      nested.where('Project.public', true);
      nested.modify(ProjectStore.orIsOwner, user);
      nested.modify(ProjectStore.orIsMember, user);
      return nested;
    })
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
    .returning('*')
    .then(getExactlyOne);
}

export function update(id: string, data: AnnotationData) {
  return database('Annotation')
    .update({
      text: data.text,
      startTime: data.startTime,
      stopTime: data.stopTime,
      pause: data.pause
    })
    .returning('*')
    .where('id', id)
    .then(getExactlyOne);
}

export function del(id: string) {
  return database('Annotation')
    .where('id', id)
    .del();
}