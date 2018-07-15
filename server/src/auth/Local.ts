
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import { IStrategyOptionsWithRequest, Strategy, VerifyFunctionWithRequest } from 'passport-local';
import * as UserStore from 'store/UserStore';

import { sendConfirmationCode } from './Utils';

passport.serializeUser(({ id }, done) => {
  done(null, id);
});

passport.deserializeUser((id, done) => {
  UserStore.getById(id)
    .then(result => {
      if (result) {
        return done(null, result);
      } else {
        console.error(
          `Deserialize user failed: user with id ${id} does not exist`);
        return done(new Error('InvalidUser'), null);
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
    UserStore.create(req.body.username, email, password)
      .then(user => {
        return sendConfirmationCode(user.code, user);
      })
      .then(user => done(null, user))
      .catch(error => done(error));
}

const loginStrategy = new Strategy(options, (req, email, password, done) => {
  return UserStore.getByEmail(email)
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
      console.error(`Login failed: ${email} does not exist`);
      return done(new Error('InvalidUser'));
    })
    .catch(error => done(error));
});

const signupStrategy = new Strategy(options, verifySignup());

passport.use('local-login', loginStrategy);
passport.use('local-signup', signupStrategy);

export = passport;