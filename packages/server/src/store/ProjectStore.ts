import builder, { getExactlyOne } from 'utils/Postgres';

import { ProjectData, NewProjectData, ProjectShareData } from '@celluloid/commons';
import { UserRecord } from '@celluloid/commons';
import { QueryBuilder } from 'knex';

export const orIsAuthor =
  (nested: QueryBuilder, user?: UserRecord) =>
    user ?
      nested.orWhere('Project.userId', '=', user.id)
      : nested;

export const filterNull = (prop: string) =>
  // tslint:disable-next-line:no-any
  (obj: any) => {
    // tslint:disable-next-line:no-any
    obj[prop] = obj[prop].filter((elem: any) => elem);
    return obj;
  };

export function isOwner(projectId: string, user: UserRecord) {
  return builder.first('id')
    .from('Project')
    .where('id', projectId)
    .andWhere('userId', user.id)
    .then((row: ProjectData) => row ? true : false);
}

export function selectAll(user: UserRecord) {
  return builder
    .select(
      builder.raw('"Project".*'),
      builder.raw(`to_json(array_agg("Tag")) AS "tags"`),
      builder.raw(`row_to_json("User") as "user"`))
    .from('Project')
    .innerJoin('User', 'User.id', 'Project.userId')
    .leftJoin('TagToProject', 'Project.id', 'TagToProject.projectId')
    .leftJoin('Tag', 'Tag.id', 'TagToProject.tagId')
    .where('Project.public', true)
    .modify(orIsAuthor, user)
    .groupBy('Project.id', 'User.id')
    .map(filterNull('tags'));
}

export function selectOneByShareName(shareName: string) {
  return builder
    .first('*')
    .from('Project')
    .where('shareName', shareName);
}

export function selectOneById(projectId: string, user: UserRecord) {
  return builder
    .first(
      builder.raw('"Project".*'),
      builder.raw(`to_json(array_agg("Tag")) as "tags"`),
      builder.raw(`row_to_json("User") as "user"`))
    .from('Project')
    .innerJoin('User', 'User.id', 'Project.userId')
    .leftJoin('TagToProject', 'Project.id', 'TagToProject.projectId')
    .leftJoin('Tag', 'Tag.id', 'TagToProject.tagId')
    .where((nested: QueryBuilder) => {
      nested.where('Project.public', true);
      if (user) {
        nested.orWhere('Project.userId', user.id);
      }
      return nested;
    })
    .andWhere('Project.id', '=', projectId)
    .groupBy('Project.id', 'User.id')
    .then((row?: ProjectData) => {
      return new Promise((resolve, reject) => {
        if (row) {
          resolve(filterNull('tags')(row));
        } else {
          reject(new Error('ProjectNotFound'));
        }
      });
    });
}

export function insert(project: NewProjectData, user: UserRecord) {
  const { tags, ...props } = project;
  return builder('Project')
    .insert({
      ...props,
      id: builder.raw('uuid_generate_v4()'),
      userId: user.id,
      publishedAt: builder.raw('NOW()'),
      views: 0,
      shares: 0,
      langId: 'fra',
    })
    .returning('*')
    .then(getExactlyOne);
}

export function update(projectId: string, props: ProjectData) {
  return builder('Project')
    .update(props)
    .returning('*')
    .where('projectId', projectId)
    .then(getExactlyOne);
}

export function del(projectId: string) {
  return builder('Project')
    .where('projectId', projectId)
    .del();
}

export function shareById(projectId: string, data: ProjectShareData) {
  return builder('Project')
    .update({
      shared: true,
      ...data
    })
    .returning('*')
    .where('projectId', projectId)
    .then(getExactlyOne);
}