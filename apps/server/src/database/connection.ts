import Knex from "knex";
import configuration from "../knexfile";
export const knex = Knex(configuration);