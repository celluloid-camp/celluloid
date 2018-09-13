import 'Config';

import ProjectsApi from 'api/ProjectApi';
import TagsApi from 'api/TagApi';
import UnfurlApi from 'api/UnfurlApi';
import UsersApi from 'api/UserApi';
import {
  deserializeUser,
  loginStrategy,
  serializeUser,
  SigninStrategy,
  studentSignupStrategy,
  teacherSignupStrategy
} from 'auth/Auth';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
import { nocache } from 'http/NoCache';
import { createStore } from 'http/SessionStore';
import * as passport from 'passport';
import { clientApp, clientDir } from 'Paths';

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
      secure: false,
      maxAge: 30 * 24 * 3600 * 1000
    },
    secret: process.env.CELLULOID_JWT_SECRET as string,
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/projects', ProjectsApi);
app.use('/api/users', UsersApi);
app.use('/api/tags', TagsApi);
app.use('/api/unfurl', UnfurlApi);

app.get('/elb-status', (_, res) => res.status(200).send());

app.use('/service-worker.js', nocache());

app.get('/*', (_, res) => res.sendFile(clientApp));

app.listen(process.env.CELLULOID_LISTEN_PORT, () => {
  console.log(
    `HTTP server listening on port ${process.env.CELLULOID_LISTEN_PORT}` +
    ` in ${process.env.NODE_ENV} mode`
  );
});
