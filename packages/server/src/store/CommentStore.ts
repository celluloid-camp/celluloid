import { CommentRecord, UserRecord } from '@celluloid/types';
import { database, getExactlyOne } from 'backends/Database';
import { QueryBuilder } from 'knex';

import * as ProjectStore from './ProjectStore';

export function selectByAnnotation(annotationId: string, user: UserRecord) {
  return database.select(
    database.raw('"Comment".*'),
    database.raw(
      'json_build_object(' +
      `'id', "User"."id",` +
      `'email', "User"."email",` +
      `'username', "User"."username",` +
      `'role', "User"."role"` +
      ') as "user"'))
    .from('Comment')
    .innerJoin('Annotation', 'Annotation.id', 'Comment.annotationId')
    .innerJoin('User', 'User.id', 'Comment.userId')
    .innerJoin('Project', 'Project.id', 'Annotation.projectId')
    .where('Comment.annotationId', annotationId)
    .andWhere((nested: QueryBuilder) => {
      nested.where('User.id', user.id);
      nested.modify(ProjectStore.orIsOwner, user);
      nested.modify(ProjectStore.orIsCollaborativeMember, user);
      return nested;
    })
    .orderBy('Comment.createdAt', 'asc');
}

export function selectOne(commentId: string) {
  return database.select(
    database.raw('"Comment".*'),
    database.raw(
      'json_build_object(' +
      `'id', "User"."id",` +
      `'email', "User"."email",` +
      `'username', "User"."username",` +
      `'role', "User"."role"` +
      ') as "user"'))
    .from('Comment')
    .innerJoin('User', 'User.id', 'Comment.userId')
    .where('Comment.id', commentId)
    .first()
    .then((row?: CommentRecord) => row ? Promise.resolve(row) :
      Promise.reject(new Error('CommentNotFound')));
}

export function insert(annotationId: string, text: string, user: UserRecord) {
  return database('Comment')
    .insert({
      id: database.raw('uuid_generate_v4()'),
      annotationId,
      userId: user.id,
      text,
      createdAt: database.raw('NOW()')
    })
    .returning('*')
    .then(getExactlyOne)
    .then(id => selectOne(id));
}

export function update(id: string, text: string) {
  return database('Comment')
    .update({
      text
    })
    .where('id', id)
    .returning('id')
    .then(getExactlyOne)
    .then(() => selectOne(id));
}

export function del(id: string) {
  return database('Comment')
    .where('id', id)
    .del();
}