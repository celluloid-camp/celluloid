module.exports = {
  apps: [
    {
      name: "frontend",
      script: "yarn workspace frontend start",
      watch: false,
    },
    {
      name: "admin",
      script: "yarn workspace admin start",
      watch: true,
    },
    {
      name: "backend",
      script: "yarn workspace backend start",
      watch: false,
    },
  ],
};
