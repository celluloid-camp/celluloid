import 'Config';

import ProjectsApi from 'api/ProjectApi';
import TagsApi from 'api/TagApi';
import UnfurlApi from 'api/UnfurlApi';
import UsersApi from 'api/UserApi';
import VideosApi from 'api/VideoApi';
import { Logger } from 'backends/Logger';
import {
  deserializeUser,
  loginStrategy,
  serializeUser,
  SigninStrategy,
  studentSignupStrategy,
  teacherSignupStrategy,
} from 'auth/Auth';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
import { nocache } from 'http/NoCache';
import { createStore } from 'http/SessionStore';
import * as passport from 'passport';
import { clientApp, clientDir } from 'Paths';

import * as expressPino from 'express-pino-logger';

require('cookie-parser');

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);
passport.use(SigninStrategy.LOGIN, loginStrategy);
passport.use(SigninStrategy.TEACHER_SIGNUP, teacherSignupStrategy);
passport.use(SigninStrategy.STUDENT_SIGNUP, studentSignupStrategy);
const app = express();

app.use(express.static(clientDir));
app.use(bodyParser.json());
app.use(compression());
app.use(
  session({
    store: createStore(),
    cookie: {
      domain: process.env.CELLULOID_COOKIE_DOMAIN
        ? process.env.CELLULOID_COOKIE_DOMAIN
        : undefined,
      secure: process.env.CELLULOID_COOKIE_SECURE === 'true',
      maxAge: 30 * 24 * 3600 * 1000,
      httpOnly: true
    },
    secret: process.env.CELLULOID_COOKIE_SECRET as string,
    resave: false,
    saveUninitialized: true
  })
);
app.use(expressPino(Logger));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/projects', ProjectsApi);
app.use('/api/users', UsersApi);
app.use('/api/tags', TagsApi);
app.use('/api/unfurl', UnfurlApi);
app.use('/api/video', VideosApi);


app.get('/elb-status', (_, res) => res.status(200).send());

app.use('/service-worker.js', nocache());

app.get('/*', (_, res) => res.sendFile(clientApp));

app.listen(process.env.CELLULOID_LISTEN_PORT, () => {
  Logger.info(
    `HTTP server listening on port ${process.env.CELLULOID_LISTEN_PORT}` +
    ` in ${process.env.NODE_ENV} mode`
  );
});
