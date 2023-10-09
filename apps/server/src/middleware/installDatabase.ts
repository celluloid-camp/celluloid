
import { Express } from "express";
import Knex from "knex";
import configuration from "../knexfile";
export const knex = Knex(configuration);

export default (app: Express) => {

    app.set("knex", knex);
  
    // const shutdownActions = getShutdownActions(app);
    // shutdownActions.push(() => {
    //   rootPgPool.end();
    // });

  };