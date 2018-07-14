
import {generateConfirmationCode} from 'auth/Utils';
import * as bcrypt from 'bcrypt';
import builder from 'common/Postgres';
import * as passport from 'passport';
import {Strategy, VerifyFunctionWithRequest, IStrategyOptionsWithRequest} from 'passport-local';
import { sendConfirmationCode } from './Utils';

function createUser(username, email, password) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);

  return builder('Teacher')
      .insert({
        id: builder.raw('uuid_generate_v4()'),
        email,
        password: hash,
        username,
        code: generateConfirmationCode,
        codeGeneratedAt: builder.raw('NOW()'),
        confirmed: false
      })
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
  passReqToCallback: true,
  usernameField: 'email'
} as IStrategyOptionsWithRequest;

function verifySignup(): VerifyFunctionWithRequest {
  return (req, email, password, done) =>
             createUser(req.body.username, email, password)
                 .then(user => sendConfirmationCode(generateConfirmationCode(), user))
                 .then(user => done(null, user))
                 .catch(error => done(error));
}

const loginStrategy = new Strategy(options, (req, email, password, done) => {
  return builder('Teacher')
      .first()
      .where('email', email)
      .then(user => {
        if (user) {
          if (!bcrypt.compareSync(password, user.password)) {
            console.error(`Login failed for user ${user.email}: bad password`);
            return done(new Error('InvalidUser'));
          } else if (!user.confirmed) {
            console.error(`Login failed: ${user.email} is not confirmed`);
            return done(new Error('UserNotConfirmed'));
          }
          return done(null, user);
        }
        console.error(`Login failed: ${user.email} does not exist`);
        return done(new Error('InvalidUser'));
      })
      .catch(error => done(error));
});

const signupStrategy = new Strategy(options, verifySignup());

passport.use('local-login', loginStrategy);
passport.use('local-signup', signupStrategy);

export = passport;