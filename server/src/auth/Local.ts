
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import * as bcrypt from 'bcrypt';

import pool from '../common/Postgres';

function createUser(email, password) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);

  return pool.query(`
    INSERT INTO "Teacher"
    VALUES (uuid_generate_v4(), $1, $2, NULL)
    RETURNING *
  `, [
    email,
    hash
  ])
}

passport.serializeUser(({id, password}, done) => {
  done(null, id);
});

passport.deserializeUser((id, done) => {
  pool.query(`
    SELECT * FROM "Teacher"
    WHERE id = $1
    `,
    [id]
  ).then(result => {
    if (result.rows.length === 1) {
      return done(null, result.rows[0]);
    }
    return done(new Error("UserNotFound"), null);
  })
  .catch(error => done(error));
});

const options = {
  usernameField: 'email'
};

passport.use('local-login', new passportLocal.Strategy(options, (email, password, done) => {
  return pool.query(`
    SELECT * FROM "Teacher"
    WHERE email = $1
    `,
    [email]
  ).then(result => {
    if (result.rows.length === 1) {
      const user = result.rows[0];
      if (!bcrypt.compareSync(password, user.password)) {
        return done(new Error("Invalid user name or password"));
      }
      return done(null, user);
    }
    return done(new Error("Invalid user name or password"));
  })
  .catch(error => done(error));
}));

passport.use('local-signup', new passportLocal.Strategy(options, (email, password, done) => {
  return createUser(email, password).then(result => {
    if (result.rows.length === 1) {
      const user = result.rows[0];
      if (!bcrypt.compareSync(password, user.password)) {
        return done(new Error("Error"));
      }
      return done(null, user);
    }
    return done(new Error("Error"));
  })
  .catch(error => done(error));
}));

export = passport;