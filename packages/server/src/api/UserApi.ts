import * as Auth from 'auth/Auth';
import {
  isLoggedIn,
  sendConfirmationCode,
  sendPasswordReset
} from 'auth/Utils';
import { Request, Response, Router } from 'express';
import * as UserStore from 'store/UserStore';
import * as validator from 'validator';

import {
  SigninResult,
  TeacherConfirmData,
  TeacherConfirmResetPasswordData,
  TeacherCredentials,
  TeacherRecord,
  TeacherSignupData,
  StudentSignupData
} from '@celluloid/commons';
import { TeacherServerRecord } from 'types/UserTypes';

const router = Router();

function validateSignup(payload: TeacherSignupData) {
  const result = { success: true, errors: {} } as SigninResult;

  if (!payload || typeof payload.username !== 'string' ||
    payload.username.trim().length === 0) {
    result.success = false;
    result.errors.username = `UsernameMissing`;
  }

  if (!payload || typeof payload.email !== 'string' ||
    !validator.isEmail(payload.email)) {
    result.success = false;
    result.errors.email = 'InvalidEmailFormat';
  }

  if (!payload || typeof payload.password !== 'string' ||
    payload.password.trim().length < 8) {
    result.success = false;
    result.errors.password = 'InvalidPasswordFormat';
  }
  return result;
}

function validateConfirmationCode(code: string): boolean {
  const codeRegExp = /^[0-9]{6}$/;
  const trimmedCode = code.replace(/\s/g, '');
  return codeRegExp.test(trimmedCode);
}

function validateConfirmResetPassword(
  payload: TeacherConfirmResetPasswordData
) {
  const result = {
    success: true,
    errors: {}
  } as SigninResult;

  if (!payload || typeof payload.email !== 'string' ||
    payload.email.trim().length === 0) {
    result.success = false;
    result.errors.email = 'InvalidEmailFormat';
  }

  if (!payload || typeof payload.password !== 'string' ||
    payload.password.trim().length < 8) {
    result.success = false;
    result.errors.password = 'InvalidPasswordFormat';
  }

  if (!payload || typeof payload.code !== 'string' ||
    !validateConfirmationCode(payload.code)) {
    result.success = false;
    result.errors.code = `InvalidCodeFormat`;
  }
  return result;
}

function validateConfirmSignup(payload: TeacherConfirmData) {
  const result = { success: true, errors: {} } as SigninResult;

  if (!payload || typeof payload.email !== 'string' ||
    !validator.isEmail(payload.email)) {
    result.success = false;
    result.errors.email = 'InvalidEmailFormat';
  }

  if (!payload || typeof payload.code !== 'string' ||
    !validateConfirmationCode(payload.code)) {
    result.success = false;
    result.errors.code = `InvalidCodeFormat`;
  }

  return result;
}

function validateLogin(payload: TeacherCredentials) {
  const result = { success: true, errors: {} } as SigninResult;

  if (!payload || typeof payload.email !== 'string' ||
    payload.email.trim().length === 0) {
    result.success = false;
    result.errors.email = `MissingEmail`;
  }

  if (!payload || typeof payload.password !== 'string' ||
    payload.password.trim().length === 0) {
    result.success = false;
    result.errors.password = 'MissingPassword';
  }

  return result;
}

function validateStudentSignup(payload: StudentSignupData) {
  const result = { success: true, errors: {} } as SigninResult;

  if (!payload || typeof payload.projectShareName !== 'string' ||
    payload.projectShareName.trim().length === 0) {
    result.success = false;
    result.errors.username = `ShareNameMissing`;
  }

  if (!payload || typeof payload.projectSharePassword !== 'string' ||
    payload.projectSharePassword.trim().length === 0) {
    result.success = false;
    result.errors.username = `SharePasswordMissing`;
  }

  if (!payload || typeof payload.username !== 'string' ||
    payload.username.trim().length === 0) {
    result.success = false;
    result.errors.username = `UsernameMissing`;
  }

  if (!payload || typeof payload.password !== 'string' ||
    payload.password.trim().length < 8) {
    result.success = false;
    result.errors.password = 'InvalidPasswordFormat';
  }

  if (!payload || typeof payload.passwordHint !== 'string' ||
    payload.passwordHint.trim().length === 0) {
    result.success = false;
    result.errors.passwordHint = 'PasswordHintMissing';
  }

  return result;
}

router.post('/student-signup', (req, res, next) => {
  const data = req.body;
  const result = validateStudentSignup(data);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return Auth.authenticate('student-sfddfsignup', error => {
    if (error) {
      console.error(`Failed to sign student up with email ${data.username}:`, error);
      if (error.code === '23505' && error.constraint === 'User_username_key') {
        return res.status(409).json({
          success: false,
          errors: { username: 'UsernameAlreadyExists' }
        });
      } else {
        return res.status(500).send();
      }
    } else {
      console.log(`New signup from student with username ${req.body.username}`, result);
      return res.status(201).json(result);
    }
  })(req, res, next);
});

router.post('/signup', (req, res, next) => {
  const result = validateSignup(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }
  return Auth.authenticate('teacher-signup', error => {
    if (error) {
      console.error(`Failed to sign user up with email ${req.body.email}:`, error);
      if (error.code === '23505' && error.constraint === 'User_username_key') {
        return res.status(409).json({
          success: false,
          errors: { username: 'UsernameAlreadyExists' }
        });
      } else if (
        error.code === '23505' &&
        error.constraint === 'User_email_key'
      ) {
        return res
          .status(409)
          .json({
            success: false,
            errors: { email: 'EmailAlreadyExists' }
          });
      } else {
        return res.status(500).send();
      }
    } else {
      console.log(`New signup from teacher with email ${req.body.email}`, result);
      return res.status(201).json(result);
    }
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  const result = validateLogin(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }
  return Auth.authenticate('teacher-login', (error, user, info) => {
    if (error) {
      result.success = false;
      result.errors = { server: error.message };
      return res.status(401).json(result);
    } else {
      return req.login(user, err => {
        if (err) {
          result.success = false;
          result.errors = { server: error.message };
          return res.status(500).json(result);
        } else {
          return res.status(200).json(result);
        }
      });
    }
  })(req, res, next);
});

function compareCodes(expected: string, actual: string) {
  return expected.replace(/\s/g, '') === actual.replace(/\s/g, '');
}

router.post('/confirm-signup', (req, res, next) => {
  const payload = req.body;
  const result = validateConfirmSignup(payload);
  if (!result.success) {
    return res.status(400).json(result);
  }
  return UserStore.getByEmail(payload.email).then((user: TeacherServerRecord) => {
    if (!user) {
      console.error(
        `Failed to confirm signup: user` +
        `with email ${payload.email} not found`
      );
      return res
        .status(401)
        .json({
          success: false,
          errors: { server: 'InvalidUser' }
        });
    } else {
      if (compareCodes(user.code, payload.code)) {
        return UserStore.confirmByEmail(payload.email)
          .then(() => {
            return res.status(200).json({ success: true, errors: {} });
          })
          .catch((error: Error) => {
            console.error(
              `Failed to confirm signup for user` +
              `with email ${payload.email}`,
              error
            );
            return res
              .status(500)
              .json({
                success: true,
                errors: { server: 'RequestFailed' }
              });
          });
      } else {
        console.error(
          `Failed to confirm signup for user` +
          ` with email ${payload.email}:` +
          ` received code ${payload.code}, expected ${user.code}`
        );
        return res
          .status(401)
          .json({
            success: false,
            errors: { server: 'InvalidUser' }
          });
      }
    }
  });
});

router.post('/confirm-reset-password', (req, res) => {
  const payload = req.body;
  const result = validateConfirmResetPassword(payload);
  if (!result.success) {
    return res.status(400).json(result);
  }
  return UserStore.getByEmail(payload.email).then((user?: TeacherServerRecord) => {
    if (!user) {
      console.error(
        `Failed to confirm password reset: user` +
        ` with email ${payload.email} not found`
      );
      return res
        .status(401)
        .json({ success: false, errors: { server: 'InvalidUser' } });
    } else {
      if (compareCodes(user.code, payload.code)) {
        return UserStore.updatePasswordByEmail(
          payload.email.trim(),
          payload.password
        )
          .then(() => {
            return res.status(200).json({ success: true, errors: {} });
          })
          .catch((error: Error) => {
            console.error(
              `Failed to confirm password reset for user` +
              ` with email ${payload.email}`,
              error
            );
            return res
              .status(500)
              .json({
                success: true,
                errors: { server: 'RequestFailed' }
              });
          });
      } else {
        console.error(
          `Failed to confirm password reset` +
          ` for user with email ${payload.email}:` +
          ` received code ${payload.code}, expected ${user.code}`
        );
        return res
          .status(401)
          .json({
            success: false,
            errors: { server: 'InvalidUser' }
          });
      }
    }
  });
});

const resendCode = (sender: (user: TeacherRecord) =>
  Promise<TeacherServerRecord>) =>
  (req: Request, res: Response) => {
    const payload = req.body;
    if (!payload.email || payload.email.trim().length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          errors: { email: 'MissingEmail' }
        });
    }
    return UserStore
      .getByEmail(payload.email)
      .then((user?: TeacherServerRecord) => {
        if (!user) {
          // tslint:disable-next-line:no-console
          console.error(
            `Failed to resend authorization code:` +
            ` user with email ${payload.email} not found`
          );
          return res
            .status(401)
            .json({
              success: false,
              errors: { server: 'InvalidUser' }
            });
        } else {
          return UserStore.updateCodeByEmail(payload.email).then(
            (updatedUser: TeacherRecord) => {
              return sender(updatedUser)
                .then(() => {
                  return res
                    .status(200)
                    .json({ success: true, errors: {} });
                });
            }
          );
        }
      })
      .catch((error: Error) => {
        // tslint:disable-next-line:no-console
        console.error(
          `Failed to resend authorization code for user ` +
          ` with email ${payload.email}`,
          error
        );
        return res.status(500).send();
      });
  };

router.post('/reset-password', (req, res) => {
  return resendCode(sendPasswordReset)(req, res);
});

router.post('/resend-code', (req, res) => {
  return resendCode(sendConfirmationCode)(req, res);
});

router.get('/me', isLoggedIn, (req, res) => {
  if (req.user) {
    return res.status(200).json({
      teacher: {
        email: req.user.email,
        username: req.user.username,
        id: req.user.id
      }
    });
  } else {
    return res.status(500).send();
  }
});

router.put('/logout', isLoggedIn, (req, res) => {
  req.logout();
  return res.status(200).send();
});

export default router;
