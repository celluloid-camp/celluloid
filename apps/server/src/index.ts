import "./Config";

import bodyParser from "body-parser";
import compression from "compression";
import express from "express";
// import expressPino from "express-pino-logger";
import passport from "passport";

import ProjectsApi from "./api/ProjectApi";
import TagsApi from "./api/TagApi";
import UnfurlApi from "./api/UnfurlApi";
import UsersApi from "./api/UserApi";
import VideosApi from "./api/VideoApi";
import {
  loginStrategy,
  SigninStrategy,
  studentSignupStrategy,
  teacherSignupStrategy,
} from "./auth/Auth";
import { logger } from "./backends/Logger";
import { createSession } from "./http/SessionStore";
const packageJson = require('../package.json');

require("cookie-parser");

const log = logger("http");

passport.use(SigninStrategy.LOGIN, loginStrategy);
passport.use(SigninStrategy.TEACHER_SIGNUP, teacherSignupStrategy);
passport.use(SigninStrategy.STUDENT_SIGNUP, studentSignupStrategy);
const app = express();

// app.use(express.static(publicDir));
// app.use(express.static(clientDir));
app.use(bodyParser.json());
app.use(compression());
app.use(createSession());
// app.use(expressPino({ logger: log }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/status", (_, res) => res.status(200).json({
  commit: process.env.COMMIT,
  version: packageJson.version
}));

app.use("/api/projects", ProjectsApi);
app.use("/api/users", UsersApi);
app.use("/api/tags", TagsApi);
app.use("/api/unfurl", UnfurlApi);
app.use("/api/video", VideosApi);


// app.get("/*", (_, res) => res.sendFile(clientApp));


(async () => {
  try {
    app.listen(process.env.CELLULOID_LISTEN_PORT, () => {
      log.info(
        `HTTP server listening on port ${process.env.CELLULOID_LISTEN_PORT}` +
        ` in ${process.env.NODE_ENV} mode`
      );
    });
  } catch (err) {
    log.error(err);
  }
})();
