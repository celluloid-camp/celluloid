
import builder from '../common/Postgres';

import * as ProjectsData from './Projects';

export function getAll(projectId, user) {
  return builder
      .select(
          builder.raw('"Annotation".*'),
          builder.raw(
              'json_build_object(' +
              `'id', "Teacher"."id",` +
              `'email', "Teacher"."email",` +
              `'firstName', "Teacher"."firstName"` +
              `'lastName', "Teacher.lastName"` +
              ') as "teacher"'))
      .from('Annotation')
      .innerJoin('Teacher', 'Teacher.id', 'Annotation.teacherId')
      .where('Annotation.projectId', projectId)
      .orderBy('Annotation.startTime', 'asc');
}

export function getOne(annotationId: string, user) {
  return builder.first()
      .from('Annotation')
      .innerJoin('Project', 'Project.id', 'Annotation.projectId')
      .where('Annotation.id', annotationId)
      .whereAnd(builder => {
        builder.where('Project.public', true);
        builder.modify(ProjectsData.orIsAuthor, user);
        return builder;
      })
      .then(
          row => row ? Promise.resolve(row) :
                       Promise.reject(new Error('AnnotationNotFound')));
}

export const create = (annotation, user, projectId) => () =>
    builder('Annotation')
        .insert({
          'id': builder.raw('uuid_generate_v4()'),
          'text': annotation.text,
          'startTime': annotation.startTime,
          'stopTime': annotation.stopTime,
          'pause': annotation.pause,
          'teacherId': user.id,
          'projectId': projectId
        })
        .returning(builder.raw('*'))
        .then(rows => rows[0])
        .catch(error => {
          console.error('Failed to create annotation', error);
          Promise.resolve(new Error('AnnotationInsertionError'));
        });

export const update = (id, data) => () => {
  return builder('Annotation')
      .update({
        text: data.text,
        startTime: data.startTime,
        stopTime: data.stopTime,
        pause: data.pause
      })
      .returning(builder.raw('*'))
      .where('id', id)
};