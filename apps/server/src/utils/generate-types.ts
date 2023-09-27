const { knex } = require("knex");
const { updateTypes } = require("knex-types");

const db = knex(require("../knexfile").development);

updateTypes(db, { output: "../types.ts" }).catch((err:any) => {
  console.error(err);
  process.exit(1);
});