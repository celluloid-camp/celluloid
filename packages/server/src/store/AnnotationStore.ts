
import builder, { getExactlyOne } from 'utils/Postgres';
import * as ProjectStore from './ProjectStore';
import { TeacherRecord } from '@celluloid/commons';
import { AnnotationRecord, AnnotationData } from '@celluloid/commons';

import { QueryBuilder } from 'knex';
import { TeacherServerRecord } from 'types/UserTypes';

export function getAll(projectId: string, user?: TeacherRecord) {
  return builder
    .select(
      builder.raw('"Annotation".*'),
      builder.raw(
        'json_build_object(' +
        `'id', "User"."id",` +
        `'email', "User"."email",` +
        `'username', "User"."username"` +
        ') as "teacher"'))
    .from('Annotation')
    .innerJoin('Project', 'Project.id', 'Annotation.projectId')
    .innerJoin('User', 'User.id', 'Annotation.userId')
    .where('Annotation.projectId', projectId)
    .andWhere((nested: QueryBuilder) => {
      nested.where('Project.public', true);
      nested.modify(ProjectStore.orIsAuthor, user);
      return nested;
    })
    .orderBy('Annotation.startTime', 'asc');
}

export function getOne(annotationId: string, user?: TeacherServerRecord) {
  return builder.first()
    .from('Annotation')
    .innerJoin('Project', 'Project.id', 'Annotation.projectId')
    .where('Annotation.id', annotationId)
    .andWhere((nested: QueryBuilder) => {
      nested.where('Project.public', true);
      nested.modify(ProjectStore.orIsAuthor, user);
      return nested;
    })
    .then((row?: AnnotationRecord) => row ? Promise.resolve(row) :
      Promise.reject(new Error('AnnotationNotFound')));
}

export function create(
  annotation: AnnotationData,
  user: TeacherRecord,
  projectId: string
) {
  return builder('Annotation')
    .insert({
      id: builder.raw('uuid_generate_v4()'),
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
  return builder('Annotation')
    .update({
      text: data.text,
      startTime: data.startTime,
      stopTime: data.stopTime,
      pause: data.pause
    })
    .returning('*')
    .where('id', id);
}

export function del(id: string) {
  return builder('Annotation')
    .where('id', id)
    .del();
}