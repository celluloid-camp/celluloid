import {triggerAsyncId} from 'async_hooks';
import {ResourceGroupsTaggingAPI} from 'aws-sdk';
import builder from 'common/Postgres';

import {ProjectData} from '../../../common/src/types/ProjectTypes';

export const orIsAuthor = (builder, user) =>
    user ? builder.orWhere('Project.userId', '=', user.id) : builder;

export const filterNull = prop => obj => {
  obj[prop] = obj[prop].filter(elem => elem);
  return obj
};

export function isOwner(projectId, user) {
  if (user) {
    return builder.first('id')
        .from('Project')
        .where('id', projectId)
        .andWhere('userId', user)
        .then(row => row ? true : false);
  } else {
    return Promise.resolve(false)
  }
}

export function getAll(user) {
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
      .map(filterNull('tags'))
}

export function getOne(projectId, user) {
  return builder
      .first(
          builder.raw('"Project".*'),
          builder.raw(`to_json(array_agg("Tag")) as "tags"`),
          builder.raw(`row_to_json("User") as "user"`))
      .from('Project')
      .innerJoin('User', 'User.id', 'Project.userId')
      .leftJoin('TagToProject', 'Project.id', 'TagToProject.projectId')
      .leftJoin('Tag', 'Tag.id', 'TagToProject.tagId')
      .where(builder => {
        builder.where('Project.public', true);
        if (user) {
          builder.orWhere('Project.userId', '=', user.id)
        }
        return builder;
      })
      .andWhere('Project.id', '=', projectId)
      .groupBy('Project.id', 'User.id')
      .then(row => {
        return new Promise((resolve, reject) => {
          if (row) {
            resolve(filterNull('tags')(row));
          } else {
            reject(new Error('ProjectNotFound'));
          }
        });
      });
}

export function create(project, user) {
  const {tags, ...props} = project;
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
      .returning(builder.raw('*'))
}

export function update(project, projectId): Promise<ProjectData> {
  return builder('Project')
      .update(project)
      .returning(builder.raw('*'))
      .where('projectId', projectId)
      .then(rows => rows[0]);
}