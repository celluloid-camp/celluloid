// const { faker } = require("@faker-js/faker");
module.exports = {
  celluloid: {
    output: {
      mode: "split",
      target: "src/api/index.ts",
      schemas: "src/api/model",
      client: "react-query",
      mock: false,
    },
    input: {
      target: "../server/public/swagger.json"
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
};
