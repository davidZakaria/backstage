const path = require("path");

/** Repo root (parent of deploy/) */
const appRoot = path.join(__dirname, "..");

/** Use 3001 so another Node app can keep 3000. Match Nginx upstream. */
const PORT = "3001";

module.exports = {
  apps: [
    {
      name: "backstage",
      cwd: appRoot,
      script: "npm",
      args: "run start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT,
      },
    },
  ],
};
