import { TeacherRecord } from "@celluloid/types";
import {
  validateConfirmResetPassword,
  validateConfirmSignup,
  validateLogin,
  validateSignup,
  validateStudentSignup,
} from "@celluloid/validators";
import { Request, Response, Router } from "express";
import passport from "passport";

import { SigninStrategy } from "../auth/Auth";
import {
  isLoggedIn,
  sendConfirmationCode,
  sendPasswordReset,
} from "../auth/Utils";
import { hasConflictedOn } from "../backends/Database";
import { logger } from "../backends/Logger";
import * as UserStore from "../store/UserStore";
import { TeacherServerRecord } from "../types/UserTypes";

const log = logger("api/User");

const router = Router();

router.post("/student-signup", (req, res, next) => {
  const payload = req.body;
  const result = validateStudentSignup(payload);


  if (!result.success) {
    log.error(
      `Failed student signup with data ${payload}: bad request:`,
      result
    );
    return res.status(400).json(result);
  }
  return passport.authenticate(SigninStrategy.STUDENT_SIGNUP, (error: Error) => {
    if (error) {
      console.log("error", error)
      log.error(
        `Failed student signup with username ${payload.username}:`,
        error
      );
      if (hasConflictedOn(error, "User", "username")) {
        return res.status(409).json({
          success: false,
          errors: { username: "UsernameAlreadyTaken" },
        });
      } else if (error.message === "IncorrectProjectPassword") {
        return res.status(403).send();
      } else {
        return res.status(500).send();
      }
    } else {
      log.info(
        `New signup for student with username ${payload.username}`,
        result
      );
      return res.status(201).json(result);
    }
  })(req, res, next);
});

router.post("/signup", (req, res, next) => {
  const payload = req.body;
  const result = validateSignup(payload);

  if (!result.success) {
    log.error(`Failed user signup with data ${payload}: bad request:`, result);
    return res.status(400).json(result);
  }

  return passport.authenticate(SigninStrategy.TEACHER_SIGNUP, (error: Error) => {
    if (error) {
      log.error(`Failed user signup with email ${payload.email}:`, error);
      if (hasConflictedOn(error, "User", "username")) {
        return res.status(409).json({
          success: false,
          errors: { username: "UsernameAlreadyTaken" },
        });
      } else if (hasConflictedOn(error, "User", "email")) {
        return res.status(409).json({
          success: false,
          errors: { email: "EmailAlreadyTaken" },
        });
      } else {
        return res.status(500).send();
      }
    } else {
      log.info(`New signup from teacher with email ${payload.email}`, result);
      return res.status(201).json(result);
    }
  })(req, res, next);
});

router.post("/login", (req, res, next) => {
  const payload = req.body;
  const result = validateLogin(req.body);

  if (!result.success) {
    log.error(
      `Failed user login with data ${JSON.stringify(payload)}: bad request:`,
      result
    );
    return res.status(400).json(result);
  }
  return passport.authenticate(SigninStrategy.LOGIN, (error: Error, user: Express.User) => {
    if (error) {
      log.error(`Failed user login with data ${payload}:`, error);
      return res.status(401).json({
        success: false,
        errors: { server: error.message },
      });
    } else {
      return req.login(user, (err) => {
        if (err) {
          return res.status(500).send();
        } else {
          return res.status(200).json(result);
        }
      });
    }
  })(req, res, next);
});

function compareCodes(expected: string, actual: string) {
  return expected.replace(/\s/g, "") === actual.replace(/\s/g, "");
}

router.post("/confirm-signup", (req, res) => {
  const payload: any = req.body;
  const result = validateConfirmSignup(payload);

  if (!result.success) {
    return res.status(400).json(result);
  }
  return UserStore.selectOneByUsernameOrEmail(payload.login)
    .then((user: TeacherServerRecord) => {
      if (!user) {
        log.error(
          `Failed to confirm signup: user` +
          ` with email ${payload.login} not found`
        );
        return res.status(401).json({
          success: false,
          errors: { server: "InvalidUser" },
        });
      } else {
        if (compareCodes(user.code || "", payload.code)) {
          return UserStore.confirmByEmail(payload.login)
            .then(() => res.status(200).json(result))
            .catch((error: Error) => {
              log.error(
                `Failed to confirm signup for user` +
                ` with email ${payload.login}:`,
                error
              );
              return res.status(500).send();
            });
        } else {
          log.error(
            `Failed to confirm signup for user with email` +
            ` ${payload.login}: received code ${payload.code}, expected ${user.code}`
          );
          return res.status(401).json({
            success: false,
            errors: { server: "InvalidUser" },
          });
        }
      }
    })
    .catch((error) => {
      log.error(`Failed to confirm signup:`, error);
      return res.status(500).send();
    });
});

router.post("/confirm-reset-password", (req, res) => {
  const payload: any = req.body;
  const result = validateConfirmResetPassword(payload);

  if (!result.success) {
    return res.status(400).json(result);
  }
  return UserStore.selectOneByUsernameOrEmail(payload.login)
    .then((user?: TeacherServerRecord) => {
      if (!user) {
        log.error(
          `Failed to confirm password reset: user with email ${payload.login} not found`
        );
        return res.status(401).json({
          success: false,
          errors: { server: "InvalidUser" },
        });
      } else {
        if (compareCodes(user.code || "", payload.code)) {
          return UserStore.updatePasswordByEmail(
            payload.login.trim(),
            payload.password
          )
            .then(() => res.status(200).json(result))
            .catch((error: Error) => {
              log.error(
                `Failed to confirm password reset for user with email ${payload.login}`,
                error
              );
              return res.status(500).send();
            });
        } else {
          log.error(
            `Failed to confirm password reset for user with email ${payload.login}:` +
            ` received code ${payload.code}, expected ${user.code}`
          );
          return res.status(401).json({
            success: false,
            errors: { server: "InvalidUser" },
          });
        }
      }
    })
    .catch((error) => {
      log.error(`Failed to confirm password reset:`, error);
      return res.status(500).send();
    });
});

const resendCode =
  (sender: (user: TeacherRecord) => Promise<TeacherServerRecord>) =>
    (req: Request, res: Response) => {
      const payload = req.body;

      if (!payload.email || payload.email.trim().length === 0) {
        return res.status(400).json({
          success: false,
          errors: { email: "MissingEmail" },
        });
      }
      return UserStore.selectOneByUsernameOrEmail(payload.email)
        .then((user?: TeacherServerRecord) => {
          if (!user) {
            log.error(
              `Failed to resend authorization code:` +
              ` user with email ${payload.email} not found`
            );
            return res.status(401).json({
              success: false,
              errors: { server: "InvalidUser" },
            });
          } else {
            return UserStore.updateCodeByEmail(payload.email).then(
              (updatedUser: TeacherRecord) =>
                sender(updatedUser).then(() =>
                  res.status(200).json({ success: true, errors: {} })
                )
            );
          }
        })
        .catch((error: Error) => {
          log.error(
            `Failed to resend authorization code for user ` +
            ` with email ${payload.email}`,
            error
          );
          return res.status(500).send();
        });
    };

router.post("/reset-password", (req, res) => {
  return resendCode(sendPasswordReset)(req, res);
});

router.post("/resend-code", (req, res) => {
  return resendCode(sendConfirmationCode)(req, res);
});

router.get("/me", isLoggedIn, (req: any, res) => {
  if (req.user) {
    return res.status(200).json({
      // compatibility with old frontend
      teacher: {
        username: req.user.username,
        id: req.user.id,
        role: req.user.role,
      },
      username: req.user.username,
      id: req.user.id,
      role: req.user.role,
      email: req.user.email,
    });
  } else {
    return res.status(401).send();
  }
});

router.put("/logout", isLoggedIn, (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(400).send("Unable to log out");
      } else {
        res.send("Logout successful");
      }
    });
  } else {
    res.end();
  }
});

export default router;
