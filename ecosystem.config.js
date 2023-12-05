module.exports = {
  apps: [
    {
      name: "PrismaMigrate",
      script: "yarn",
      args: "prisma migrate:deploy",
      interpreter: "sh",
      autorestart: false,
      watch: false,
    },
    {
      name: "admin",
      script: "yarn",
      args: "admin start",
      interpreter: "sh",
      watch: false,
    },
    {
      name: "backend",
      script: "yarn",
      args: "backend start",
      interpreter: "sh",
      watch: false,
    },
  ],
};
