import builder from 'common/Postgres';
import {ProjectData} from '../../../common/src/types/ProjectTypes';

export const orIsAuthor = (builder, user) =>
    user ? builder.orWhere('Project.authorId', '=', user.id) : builder;

export const filterNull = prop => obj => {
  obj[prop] = obj[prop].filter(elem => elem);
  return obj
};

export function isOwner(projectId, user) {
  if (user) {
    return builder.first('id')
        .from('Project')
        .where('id', projectId)
        .andWhere('authorId', user)
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
          builder.raw(`row_to_json("Teacher") as "author"`))
      .from('Project')
      .innerJoin('Teacher', 'Teacher.id', 'Project.authorId')
      .leftJoin('TagToProject', 'Project.id', 'TagToProject.projectId')
      .leftJoin('Tag', 'Tag.id', 'TagToProject.tagId')
      .where('Project.public', true)
      .modify(orIsAuthor, user)
      .groupBy('Project.id', 'Teacher.id')
      .map(filterNull('tags'))
}

export function getOne(projectId, user) {
  return builder
      .first(
          builder.raw('"Project".*'),
          builder.raw(`to_json(array_agg("Tag")) as "tags"`),
          builder.raw(`row_to_json("Teacher") as "author"`))
      .from('Project')
      .innerJoin('Teacher', 'Teacher.id', 'Project.authorId')
      .leftJoin('TagToProject', 'Project.id', 'TagToProject.projectId')
      .leftJoin('Tag', 'Tag.id', 'TagToProject.tagId')
      .where(builder => {
        builder.where('Project.public', true);
        if (user) {
          builder.orWhere('Project.authorId', '=', user.id)
        }
        return builder;
      })
      .andWhere('Project.id', '=', projectId)
      .groupBy('Project.id', 'Teacher.id')
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
  return builder('Project')
      .insert({
        ...project,
        id: builder.raw('uuid_generate_v4()'),
        authorId: user.id,
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