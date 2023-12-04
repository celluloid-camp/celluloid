module.exports = {
  apps: [
    {
      name: "frontend",
      script: "yarn",
      args: "frontend start",
      interpreter: "bash",
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
