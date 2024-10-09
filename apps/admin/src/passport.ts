import { prisma, type User, UserRole } from "@celluloid/prisma";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";



passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (user) {
    return done(null, user);
  } else {
    console.error(
      `Deserialize user failed: user with id` + ` ${id} does not exist`,
    );
    return done(new Error("InvalidUser"));
  }
});

passport.use(
  new LocalStrategy(async (username: string, password: string, done) => {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });
    if (!user) {
      return done(new Error("InvalidUser"));
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return done(new Error("InvalidUser"));
    }
    if (!user.confirmed && user.role !== UserRole.Student) {
      return done(new Error("UserNotConfirmed"));
    }
    return done(null, user);
  }),
);

const loginStrategy = new LocalStrategy(
  { usernameField: "login" },
  async (login, password, done) => {
    const user = await prisma.user.findUnique({
      where: {
        OR: [{ email: login }, { username: login }],
      },
    });

    if (!user) {
      return Promise.resolve(done(new Error("InvalidUser")));
    }
    if (!bcrypt.compareSync(password, user.password)) {
      console.error(
        `Login failed for user ${user.username}: incorrect password`,
      );
      return Promise.resolve(done(new Error("InvalidUser")));
    }
    if (!user.confirmed && user.role !== UserRole.Student) {
      console.error(`Login failed: ${user.username} is not confirmed`);
      return Promise.resolve(done(new Error("UserNotConfirmed")));
    }
    return Promise.resolve(done(null, user));
  },
);

passport.use("login", loginStrategy);

export default passport;
