import ProjectsApi from 'api/ProjectsApi';
import TagsApi from 'api/TagsApi';
import TeachersApi from 'api/TeachersApi';
import * as passport from 'auth/Local';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as session from 'express-session';
import * as nocache from 'nocache';
import * as path from 'path';

require('cookie-parser');

dotenv.config();

const app = express();

app.use(express.static('../client/build/'));
app.use(bodyParser.json());
app.use(compression());
app.use(
  session({
    secret: process.env.CELLULOID_JWT_SECRET,
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/projects/', ProjectsApi);
app.use('/api/teachers/', TeachersApi);
app.use('/api/tags', TagsApi);

app.get('/elb-status', (req, res) => {
  return res.status(200).send();
});

app.use('/service-worker.js', nocache());

app.get('/*', (req, res) => {
  return res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.listen(process.env.CELLULOID_LISTEN_PORT, () => {
  console.log(
    `HTTP server listening on port ${process.env.CELLULOID_LISTEN_PORT}` +
      ` in ${process.env.NODE_ENV} mode`
  );
});
