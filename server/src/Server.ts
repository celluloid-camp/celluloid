import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as nocache from 'nocache';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as passport from 'auth/Local';
import * as session from 'express-session';
import ApiProjects from 'api/Projects';
import ApiTeachers from 'api/Teachers';
import ApiTags from 'api/Tags';

require('cookie-parser');

dotenv.config();

const app = express();

app.use(express.static('../client/build/'));
app.use(bodyParser.json());
app.use(compression());
app.use(session({
  secret: process.env.CELLULOID_JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/projects/', ApiProjects);
app.use('/api/teachers/', ApiTeachers);
app.use('/api/tags', ApiTags)

app.get('/elb-status', (req, res) => {
  res.status(200);
  res.send();
});

app.use('/service-worker.js', nocache());

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.listen(process.env.CELLULOID_LISTEN_PORT, () => {
  console.log(
    `HTTP server listening on port ${process.env.CELLULOID_LISTEN_PORT}`
    + ` in ${process.env.NODE_ENV} mode`
  );
});
