export * from "./types";

import { Knex } from "knex";
import { Annotation, Comment, Project, User } from "./types";

declare module "knex/types/tables" {
  interface Tables {
    // This is same as specifying `knex<User>('users')`
    users: User;
    annotations: Annotation;
    comments: Comment;
    projects: Project;
  }
}
