import {
  ProjectCreateData,
  ProjectRecord,
  ProjectShareData,
  UserRecord,
} from "@celluloid/types";
import { Knex } from "knex";

import { generateUniqueShareName } from "../auth/Utils";
import {
  database,
  filterNull,
  getExactlyOne,
  hasConflictedOn,
} from "../backends/Database";
import { logger } from "../backends/Logger";
import { Project, User } from "../knex";
import { tagProject } from "./TagStore";

const log = logger("store/ProjectStore");

export const orIsMember = (nested: Knex.QueryBuilder, user?: UserRecord) =>
  user
    ? nested.orWhereIn(
      "Project.id",
      database
        .select("projectId")
        .from("UserToProject")
        .where("userId", user.id)
    )
    : nested;

export const orIsOwner = (nested: Knex.QueryBuilder, user?: UserRecord) =>
  user ? nested.orWhere("Project.userId", user.id) : nested;

function filterUserProps({ id, username, role }: UserRecord) {
  return {
    id,
    username,
    role,
  };
}

export function isOwnerOrCollaborativeMember(
  projectId: string,
  user: UserRecord
) {
  return Promise.all([
    isOwner(projectId, user),
    isCollaborativeMember(projectId, user),
  ]).then(([owner, member]: boolean[]) => owner || member);
}

export function isOwner(projectId: string, user: UserRecord) {
  return database
    .first("id")
    .from("Project")
    .where("id", projectId)
    .andWhere("userId", user.id)
    .then((row: string) => (row ? true : false));
}

export function isMember(projectId: string, user: Partial<UserRecord>) {
  return (
    database
      .first("projectId")
      .from("UserToProject")
      .where("UserToProject.projectId", projectId)
      // @ts-ignore
      .andWhere("UserToProject.userId", user.id)
      .then((row: string) => (row ? true : false))
  );
}

export function isCollaborativeMember(projectId: string, user: UserRecord) {
  return database
    .first("projectId")
    .from("UserToProject")
    .innerJoin("Project", "Project.id", "UserToProject.projectId")
    .where("UserToProject.projectId", projectId)
    .andWhere("UserToProject.userId", user.id)
    .andWhere("Project.collaborative", true)
    .then((row: string) => (row ? true : false));
}

// < Project[] &{
//   tags: Tag[],
//   user: User
// }>
export function selectAll(user: UserRecord): Promise<ProjectRecord[]> {
  return database("projects")
    .select(
      database.raw('"Project".*'),
      // database.raw(`to_json(array_agg("Tag")) AS "tags"`),
      database.raw(`row_to_json("User") as "user"`)
    )
    .from("Project")
    .innerJoin("User", "User.id", "Project.userId")
    // .leftJoin("TagToProject", "Project.id", "TagToProject.projectId")
    // .leftJoin("Tag", "Tag.id", "TagToProject.tagId")
    .where("Project.public", true)
    .modify(orIsOwner, user)
    .modify(orIsMember, user)
    .groupBy("Project.id", "User.id")
    .then((rows) =>
      rows.map((r: any) => ({
        ...r,
        user: filterUserProps(r.user),
      })
      )
    );
}



export function selectOneByShareName(shareCode: string) {
  return database.first("*").from("Project").where("shareCode", shareCode);
}

export function selectOne(projectId: string, user: Partial<UserRecord>) {
  return database
    .first(
      database.raw('"Project".*'),
      // database.raw(`to_json(array_agg("Tag")) as "tags"`),
      database.raw(`row_to_json("User") as "user"`)
    )
    .from("Project")
    .innerJoin("User", "User.id", "Project.userId")
    // .leftJoin("TagToProject", "Project.id", "TagToProject.projectId")
    // .leftJoin("Tag", "Tag.id", "TagToProject.tagId")
    .where((nested: Knex.QueryBuilder) => {
      nested.where("Project.public", true);
      nested.modify(orIsMember, user);
      nested.modify(orIsOwner, user);
    })
    .andWhere("Project.id", projectId)
    .groupBy("Project.id", "User.id")
    .then((row?) => {
      return new Promise((resolve, reject) => {
        if (row) {
          return selectProjectMembers(projectId).then((members) =>
            resolve(
              {
                user: filterUserProps(row.user),
                members,
                ...row,
              }
            )
          );
        } else {
          return reject(new Error("ProjectNotFound"));
        }
      });
    });
}

export function insert(project: ProjectCreateData, user: UserRecord) {
  const INSERT_RETRY_COUNT = 20;
  const { tags, ...props } = project;
  const query: any = (retry: number) =>
    database("Project")
      .insert<Project>({
        ...props,
        userId: user.id,
        publishedAt: database.raw("NOW()"),
        shareName: generateUniqueShareName(props.title, retry),
      })
      .returning("*")
      .then(getExactlyOne)
      .catch((error) => {
        if (hasConflictedOn(error, "User", "username")) {
          if (retry < INSERT_RETRY_COUNT) {
            return query(retry + 1);
          } else {
            log.warn(
              "Failed to insert project: unique share name generation failed"
            );
          }
        }
        throw error;
      });
  return query(0).then((record: any) =>
    Promise.all(project.tags.map((tag) => tagProject(tag.id, record.id))).then(
      () => Promise.resolve({ tags, ...record })
    )
  );
}

export function update(projectId: string, props: ProjectRecord) {
  return database("Project")
    .update(props)
    .returning("*")
    .where("id", projectId)
    .then(getExactlyOne);
}

export function del(projectId: string) {
  return database("Project").where("id", projectId).del();
}

export function shareById(projectId: string, data: ProjectShareData) {
  return database("Project")
    .update({
      shared: true,
      sharePassword: data.sharePassword,
    })
    .returning("*")
    .where("id", projectId)
    .then(getExactlyOne);
}

export function unshareById(projectId: string) {
  return database("Project")
    .update({
      shared: false,
      sharePassword: null,
    })
    .returning("*")
    .where("id", projectId)
    .then(getExactlyOne);
}

export function selectProjectMembers(projectId: string) {
  return database
    .select("User.id", "User.username", "User.role")
    .from("UserToProject")
    .innerJoin("User", "User.id", "UserToProject.userId")
    .where("UserToProject.projectId", projectId)
    .then((rows) => rows.map(filterUserProps));
}

export function setPublicById(projectId: string, _public: boolean) {
  return database("Project")
    .update({
      public: _public,
    })
    .where("id", projectId)
    .returning("*")
    .then(getExactlyOne);
}

export function setCollaborativeById(
  projectId: string,
  collaborative: boolean
) {
  return database("Project")
    .update({
      collaborative,
    })
    .where("id", projectId)
    .returning("*")
    .then(getExactlyOne);
}

