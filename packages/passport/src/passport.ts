
import { prisma, type User, UserRole } from "@celluloid/prisma"
import bcrypt from 'bcryptjs';
import passport from 'passport';
import {
  Strategy as LocalStrategy,
} from "passport-local";

import { DeserializeUserError, InvalidUserError, UserNotConfirmed } from "./errors";

// export enum SigninStrategy {
//   LOGIN = "login",
//   TEACHER_SIGNUP = "teacher-signup",
//   STUDENT_SIGNUP = "student-signup",
// }


passport.serializeUser((user, done) => {
  done(null, (user as User).id)
});

passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({ where: { id } })
  if (user) {
    return done(null, user);
  }
  return done(new DeserializeUserError("Deserialize user failed: user does not exist"));

});

passport.use(
  new LocalStrategy(async (username: string, password: string, done) => {
    const user = await prisma.user.findUnique({ where: { username: username } })
    if (!user) {
      return done(new InvalidUserError("User not found"));
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return Promise.resolve(done(new InvalidUserError(`Login failed for user ${user.username}: incorrect password`)));
    }
    if (!user.confirmed && user.role !== UserRole.Student) {
      return done(new UserNotConfirmed());
    }
    return done(null, user);

  }),
);


const loginStrategy = new LocalStrategy(async (login, password, done) => {

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: login }, { username: login, }]
    }
  });

  if (!user) {
    return done(new InvalidUserError("User not found"));
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return done(new InvalidUserError(`Login failed for user ${user.username}: incorrect password`));
  }
  if (!user.confirmed && user.role !== UserRole.Student) {
    return done(new UserNotConfirmed(`Login failed: ${user.username} is not confirmed`));
  }
  return done(null, user);
}
);

passport.use("login", loginStrategy);

export default passport;
