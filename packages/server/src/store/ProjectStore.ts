import { ProjectCreateData, ProjectRecord, ProjectShareData, UserRecord } from '@celluloid/types';
import { generateUniqueShareName, hashPassword } from 'auth/Utils';
import { database, filterNull, getExactlyOne, hasConflictedOn } from 'backends/Database';
import { QueryBuilder } from 'knex';

export const orIsMember =
  (nested: QueryBuilder, user?: UserRecord) =>
    user
      ? nested.orWhereIn(
        'Project.id',
        database.select('projectId')
          .from('UserToProject')
          .where('userId', user.id))
      : nested;

export const orIsOwner =
  (nested: QueryBuilder, user?: UserRecord) =>
    user
      ? nested.orWhere('Project.userId', user.id)
      : nested;

function filterUserProps({ id, username, role }: UserRecord) {
  return {
    id,
    username,
    role
  };
}

// comment on annotations
export function isOwnerOrMember(projectId: string, user: UserRecord) {
  return Promise.all([
    isOwner(projectId, user),
    isMember(projectId, user)
  ])
    .then(([owner, member]: boolean[]) => owner || member);
}

// delete project or change details
export function isOwner(projectId: string, user: UserRecord) {
  return database.first('id')
    .from('Project')
    .where('id', projectId)
    .andWhere('userId', user.id)
    .then((row: string) => row ? true : false);
}

export function isMember(projectId: string, user: UserRecord) {
  return database.first('projectId')
    .from('UserToProject')
    .where('projectId', projectId)
    .andWhere('userId', user.id)
    .then((row: string) => row ? true : false);
}

export function selectAll(user: UserRecord) {
  return database
    .select(
      database.raw('"Project".*'),
      database.raw(`to_json(array_agg("Tag")) AS "tags"`),
      database.raw(`row_to_json("User") as "user"`))
    .from('Project')
    .innerJoin('User', 'User.id', 'Project.userId')
    .leftJoin('TagToProject', 'Project.id', 'TagToProject.projectId')
    .leftJoin('Tag', 'Tag.id', 'TagToProject.tagId')
    .where('Project.public', true)
    .modify(orIsOwner, user)
    .modify(orIsMember, user)
    .groupBy('Project.id', 'User.id')
    .map(filterNull('tags'))
    .map(row => ({
      user: filterUserProps(row.user),
      ...row
    }));
}

export function selectOneByShareName(shareName: string) {
  return database
    .first('*')
    .from('Project')
    .where('shareName', shareName);
}

export function selectOne(projectId: string, user: UserRecord) {
  return database
    .first(
      database.raw('"Project".*'),
      database.raw(`to_json(array_agg("Tag")) as "tags"`),
      database.raw(`row_to_json("User") as "user"`))
    .from('Project')
    .innerJoin('User', 'User.id', 'Project.userId')
    .leftJoin('TagToProject', 'Project.id', 'TagToProject.projectId')
    .leftJoin('Tag', 'Tag.id', 'TagToProject.tagId')
    .where((nested: QueryBuilder) => {
      nested.where('Project.public', true);
      nested.modify(orIsMember, user);
      nested.modify(orIsOwner, user);
    })
    .andWhere('Project.id', projectId)
    .groupBy('Project.id', 'User.id')
    .then((row?) => {
      return new Promise((resolve, reject) => {
        if (row) {
          return selectProjectMembers(projectId)
            .then(members =>
              resolve(filterNull('tags')({
                user: filterUserProps(row.user),
                members,
                ...row
              })));
        } else {
          return reject(new Error('ProjectNotFound'));
        }
      });
    });
}

export function insert(project: ProjectCreateData, user: UserRecord) {
  const INSERT_RETRY_COUNT = 5;
  const { tags, ...props } = project;
  const query = (retry: number) =>
    database('Project')
      .insert({
        ...props,
        id: database.raw('uuid_generate_v4()'),
        userId: user.id,
        publishedAt: database.raw('NOW()'),
        shareName: generateUniqueShareName(props.title)
      })
      .returning('*')
      .then(getExactlyOne)
      .catch(error => {
        if (hasConflictedOn(error, 'User', 'username')) {
          if (retry < INSERT_RETRY_COUNT) {
            return query(retry + 1);
          } else {
            console.log('Failed to insert project: unique share name generation failed');
          }
        }
        throw error;
      }
      );
  return query(0);
}

export function update(projectId: string, props: ProjectRecord) {
  return database('Project')
    .update(props)
    .returning('*')
    .where('projectId', projectId)
    .then(getExactlyOne);
}

export function del(projectId: string) {
  return database('Project')
    .where('projectId', projectId)
    .del();
}

export function shareById(projectId: string, data: ProjectShareData) {
  return database('Project')
    .update({
      shared: true,
      sharePassword: hashPassword(data.sharePassword),
    })
    .returning('*')
    .where('id', projectId)
    .then(getExactlyOne);
}

export function unshareById(projectId: string) {
  return database('Project')
    .update({
      shared: false,
      sharePassword: null,
    })
    .returning('*')
    .where('id', projectId)
    .then(getExactlyOne);
}

function selectProjectMembersBase(projectId: string) {
  return database
    .select(
      'User.id',
      'User.username',
      'User.role'
    )
    .from('UserToProject')
    .innerJoin('User', 'User.id', 'UserToProject.userId')
    .where('UserToProject.projectId', projectId);
}

export function selectProjectMembers(projectId: string) {
  return selectProjectMembersBase(projectId)
    .map(filterUserProps);
}

export function setPublicById(projectId: string, _public: boolean) {
  return database('Project')
    .update({
      'public': _public,
    })
    .where('id', projectId)
    .returning('*')
    .then(getExactlyOne);
}

export function setCollaborativeById(projectId: string, collaborative: boolean) {
  return database('Project')
    .update({
      collaborative,
    })
    .where('id', projectId)
    .returning('*')
    .then(getExactlyOne);
}