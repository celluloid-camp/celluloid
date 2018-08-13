import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import { IStrategyOptionsWithRequest, Strategy, VerifyFunctionWithRequest } from 'passport-local';
import * as UserStore from 'store/UserStore';
import * as ProjectStore from 'store/ProjectStore';

import { sendConfirmationCode } from './Utils';
import { TeacherRecord, UserRecord } from '@celluloid/commons';
import { TeacherServerRecord } from 'types/UserTypes';

passport.serializeUser(({ id }, done) => {
  return Promise.resolve(done(null, id));
});

passport.deserializeUser((id: string, done) => {
  return UserStore.getById(id)
    .then((result: TeacherRecord) => {
      if (result) {
        return Promise.resolve(done(null, result));
      } else {
        console.error(
          `Deserialize user failed: user with id` +
          ` ${id} does not exist`
        );
        return Promise.resolve(done(new Error('InvalidUser')));
      }
    })
    .catch((error: Error) =>
      Promise.resolve(done(error))
    );
});

const options = {
  passReqToCallback: true,
  usernameField: 'email'
} as IStrategyOptionsWithRequest;

function verifyStudentSignup(): VerifyFunctionWithRequest {
  return (req, email, password, done) => {
    console.log(`Signup student ${req.body.username}`, password, req);
    return ProjectStore.selectOneByShareName(req.body.projectShareName)
      .then(result => {
        if (result) {
          if (result.sharePassword === req.body.projectSharePassword) {
            return UserStore.createStudent(
              req.body.username,
              req.body.passwordHint,
              password);
          }
          return Promise.reject(new Error('IncorrectProjectPassword'));
        }
        return Promise.reject(new Error('ProjectNotFound'));
      })
      .then((user: UserRecord) => Promise.resolve(done(null, user)))
      .catch((error: Error) => {
        console.log(error);
        return Promise.resolve(done(error));
      });
  };
}

function verifyTeacherSignup(): VerifyFunctionWithRequest {
  return (req, email, password, done) => {
    console.log(`Signup teacher ${req.body.username}`, password, req);
    return UserStore.createTeacher(req.body.username, email, password)
      .then((user: TeacherServerRecord) => sendConfirmationCode(user))
      .then((user: TeacherRecord) => Promise.resolve(done(null, user)))
      .catch((error: Error) => Promise.resolve(done(error)));
  };
}

const teacherLogin = new Strategy(options, (_, email, password, done) => {
  return UserStore.getByEmail(email)
    .then((user: TeacherServerRecord) => {
      if (user) {
        if (!bcrypt.compareSync(password, user.password)) {
          console.error(
            `Login failed for user ${user.email}: bad password`
          );
          return Promise.resolve(done(new Error('InvalidUser')));
        } else if (!user.confirmed) {
          console.error(
            `Login failed: ${user.email} is not confirmed`
          );
          return Promise.resolve(done(new Error('UserNotConfirmed')));
        }
        return Promise.resolve(done(null, user));
      }
      console.error(`Login failed: ${email} does not exist`);
      return Promise.resolve(done(new Error('InvalidUser')));
    })
    .catch((error: Error) => Promise.resolve(done(error)));
});

const teacherSignup = new Strategy(options, verifyTeacherSignup());
const studentSignup = new Strategy(options, verifyStudentSignup());

passport.use('teacher-login', teacherLogin);
passport.use('teacher-signup', teacherSignup);
passport.use('student-signup', studentSignup);

export = passport;