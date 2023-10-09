import Knex from "knex";
import * as R from "ramda";

import configuration from "../knexfile"
import { logger } from "./Logger";

const log = logger("Database");

export const database = Knex(configuration)


export const filterNull =
  (prop: string) =>
    // tslint:disable-next-line:no-any
    (obj: any) => {
      // tslint:disable-next-line:no-any
      obj[prop] = obj[prop].filter((elem: any) => elem);
      return obj;
    };

export function getExactlyOne(rows: any[]) {
  if (rows.length === 1) {
    return Promise.resolve(rows[0]);
  } else {
    log.error("Update or insert result has less or more than one row", rows);
    return Promise.reject(Error("NotExactlyOneRow"));
  }
}

const CONFLICT_ERROR = "23505";

interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
}

export function hasConflictedOn(
  error: DatabaseError,
  table: string,
  key: string
) {
  return (
    error.code &&
    error.constraint &&
    error.code === CONFLICT_ERROR &&
    R.equals(error.constraint.split("_"), [table, key, "key"])
  );
}
