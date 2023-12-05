module.exports = {
  apps: [
    {
      name: "PrismaMigrate",
      script: "yarn",
      args: "prisma migrate:deploy",
      autorestart: false,
      watch: false,
    },
    {
      name: "admin",
      script: "yarn",
      args: "admin start",
      interpreter: "bash",
      watch: false,
    },
    {
      name: "backend",
      script: "yarn",
      args: "backend start",
      interpreter: "bash",
      watch: false,
    },
  ],
};
