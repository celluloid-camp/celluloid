
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import {Strategy} from 'passport-local';

import builder from '../common/Postgres';

function createUser(email, password) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);

  return builder('Teacher')
      .insert(
          {id: builder.raw('uuid_generate_v4()'), email: email, password: hash})
      .returning(builder.raw('*'))
      .then(result => result[0]);
}

passport.serializeUser(({id}, done) => {
  done(null, id);
});

passport.deserializeUser((id, done) => {
  builder('Teacher')
      .first()
      .where('id', id)
      .then(result => {
        if (result) {
          return done(null, result);
        } else {
          return done(new Error('UserNotFound'), null);
        }
      })
      .catch(error => done(error));
});

const options = {
  usernameField: 'email'
};

const loginStrategy = new Strategy(options, (email, password, done) => {
  return builder('Teacher')
      .first()
      .where('email', email)
      .then(user => {
        if (user) {
          if (!bcrypt.compareSync(password, user.password)) {
            console.error(`Login failed for user ${user.email}: bad password`);
            return done(new Error('InvalidUser'));
          }
          return done(null, user);
        }
        console.error(`Login failed: ${user.email} does not exist`);
        return done(new Error('InvalidUser'));
      })
      .catch(error => done(error));
});

const signupStrategy = new Strategy(options, (email, password, done) => {
  return createUser(email, password)
      .then(user => done(null, user))
      .catch(error => done(error));
});

passport.use('local-login', loginStrategy);
passport.use('local-signup', signupStrategy);

export = passport;