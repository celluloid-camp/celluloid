import * as path from 'path';
import * as dotenv from 'dotenv';
const rootDir = path.resolve(__dirname, '..', '..', '..');
dotenv.config({path: path.resolve(rootDir, '.env')});

import ProjectsApi from 'api/ProjectsApi';
import TagsApi from 'api/TagsApi';
import TeachersApi from 'api/TeachersApi';
import UnfurlApi from 'api/UnfurlApi';

import * as passport from 'auth/Auth';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
import { nocache } from 'common/NoCache';

require('cookie-parser');

const clientBuild = path.resolve(rootDir, 'packages', 'client', 'build');

const app = express();

app.use(express.static(clientBuild));
app.use(bodyParser.json());
app.use(compression());
app.use(
  session({
    secret: process.env.CELLULOID_JWT_SECRET as string,
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/projects', ProjectsApi);
app.use('/api/teachers', TeachersApi);
app.use('/api/tags', TagsApi);
app.use('/api/unfurl', UnfurlApi);

app.get('/elb-status', (req, res) => {
  return res.status(200).send();
});

app.use('/service-worker.js', nocache());

app.get('/*', (req, res) => {
  return res.sendFile(path.resolve(clientBuild, 'index.html'));
});

app.listen(process.env.CELLULOID_LISTEN_PORT, () => {
  console.log(
    `HTTP server listening on port ${process.env.CELLULOID_LISTEN_PORT}` +
    ` in ${process.env.NODE_ENV} mode`
  );
});
